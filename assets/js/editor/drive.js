/* ============================================================
   FotoLab · drive.js
   Abrir uma pasta do Google Drive colando o link.

   Como funciona: o aluno compartilha a pasta como "qualquer
   pessoa com o link" e cola o endereço aqui. A gente pergunta
   à API do Drive o que existe lá dentro (só leitura, só com a
   chave de site) e baixa a foto escolhida como um arquivo
   normal — daí em diante é o MESMO caminho de quem escolhe uma
   foto do aparelho, inclusive para RAW.

   Nada é enviado para lugar nenhum: o download vem do Google
   direto para o navegador e a edição continua sendo local.
   ============================================================ */

import { DRIVE_API_KEY, PASTA_TURMA, NOME_TURMA, SENHA_TURMA, PERMITIR_OUTRA_PASTA } from './drive-config.js?v=2';

const API = 'https://www.googleapis.com/drive/v3';
export const FOLDER_MIME = 'application/vnd.google-apps.folder';

export function hasKey() { return !!DRIVE_API_KEY; }
export { NOME_TURMA, PERMITIR_OUTRA_PASTA };

/* A pasta fixa da turma: o professor põe as fotos lá e o aluno só
   digita a senha. Aceita link ou ID no drive-config.js. */
export function pastaTurma() { return PASTA_TURMA ? parseFolderId(PASTA_TURMA) : null; }
export function pedeSenha() { return !!(SENHA_TURMA && pastaTurma()); }

/* Tranca leve, e de propósito: a senha mora no código de um site
   estático, então isto não é autenticação — é só não deixar o
   material à mão de qualquer visitante. Comparação frouxa
   (sem espaços, sem maiúsculas) porque o aluno digita no celular. */
export function senhaConfere(digitada) {
  const limpa = t => String(t || '').trim().toLowerCase();
  return limpa(digitada) === limpa(SENHA_TURMA);
}

/**
 * Aceita o que o aluno tiver em mãos: o link de compartilhamento,
 * o endereço da barra do navegador, o link "open?id=" ou o ID cru.
 */
export function parseFolderId(input) {
  const s = String(input || '').trim();
  if (!s) return null;
  if (/^[-\w]{10,}$/.test(s)) return s;                       // já é o ID
  let m = s.match(/\/folders\/([-\w]{10,})/);                 // .../drive/folders/ID
  if (m) return m[1];
  m = s.match(/[?&]id=([-\w]{10,})/);                         // .../open?id=ID
  if (m) return m[1];
  m = s.match(/\/drive\/u\/\d+\/folders\/([-\w]{10,})/);
  if (m) return m[1];
  return null;
}

async function api(path, params) {
  const q = new URLSearchParams(Object.assign({ key: DRIVE_API_KEY }, params));
  const resp = await fetch(API + path + '?' + q);
  if (resp.ok) return resp.json();

  let reason = '';
  try { reason = (await resp.json()).error.message || ''; } catch (e) { /* corpo vazio */ }
  if (resp.status === 404) {
    throw new Error('Não achei essa pasta. Confira o link — e lembre que ela precisa estar compartilhada como <b>“qualquer pessoa com o link”</b>.');
  }
  if (resp.status === 403) {
    throw new Error(/API key not valid|API_KEY|blocked|referer/i.test(reason)
      ? 'A chave da API do Drive não está aceitando este site. Avise o instrutor.'
      : 'Sem permissão para ler essa pasta. Abra o compartilhamento dela para <b>“qualquer pessoa com o link”</b> e tente de novo.');
  }
  if (resp.status === 400 && !DRIVE_API_KEY) {
    throw new Error('O recurso do Google Drive ainda não foi configurado neste site.');
  }
  throw new Error('O Google respondeu com erro (' + resp.status + '). ' + reason);
}

/** Nome da pasta, só para mostrar no topo da janela. */
export async function folderInfo(id) {
  const f = await api('/files/' + encodeURIComponent(id), { fields: 'id,name,mimeType', supportsAllDrives: 'true' });
  if (f.mimeType !== FOLDER_MIME) {
    throw new Error('Esse link é de um <b>arquivo</b>, não de uma pasta. Abra a pasta no Drive e copie o link de lá.');
  }
  return f;
}

/**
 * Lista subpastas e imagens da pasta. Traz tudo (o Drive devolve em
 * páginas de 100) porque uma pasta de exercícios pode ter centenas.
 */
export async function listFolder(id) {
  const out = [];
  let pageToken = '';
  do {
    const params = {
      q: "'" + id + "' in parents and trashed = false",
      fields: 'nextPageToken,files(id,name,mimeType,size,thumbnailLink,imageMediaMetadata(width,height))',
      orderBy: 'folder,name_natural',
      pageSize: '100',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true'
    };
    if (pageToken) params.pageToken = pageToken;
    const page = await api('/files', params);
    out.push.apply(out, page.files || []);
    pageToken = page.nextPageToken || '';
  } while (pageToken);

  const folders = out.filter(f => f.mimeType === FOLDER_MIME);
  const files = out.filter(f => f.mimeType !== FOLDER_MIME && isOpenable(f));
  return { folders, files, ignorados: out.length - folders.length - files.length };
}

const RAW_EXT = /\.(nef|nrw|cr2|cr3|crw|arw|srf|sr2|raf|rw2|orf|pef|dng|rwl|srw|3fr|x3f|iiq|mrw|kdc|dcr)$/i;
function isOpenable(f) {
  return (f.mimeType || '').startsWith('image/') || RAW_EXT.test(f.name || '');
}

/** Miniatura maior que a que o Drive manda por padrão (a padrão tem ~220 px). */
export function thumbURL(f, px) {
  if (!f.thumbnailLink) return '';
  return f.thumbnailLink.replace(/=s\d+(-[a-z]+)?$/i, '=s' + (px || 400));
}

export function prettySize(bytes) {
  const n = Number(bytes);
  if (!n) return '';
  if (n >= 1048576) return (n / 1048576).toFixed(n >= 10485760 ? 0 : 1) + ' MB';
  return Math.round(n / 1024) + ' KB';
}

/**
 * Baixa o arquivo original (resolução total, não a miniatura) e devolve
 * um File — o mesmo objeto que sai de um <input type="file">.
 * `onProgress` recebe 0..1 quando o Google informa o tamanho.
 */
export async function fetchAsFile(f, onProgress) {
  const q = new URLSearchParams({ key: DRIVE_API_KEY, alt: 'media', supportsAllDrives: 'true' });
  const resp = await fetch(API + '/files/' + encodeURIComponent(f.id) + '?' + q);
  if (!resp.ok) {
    if (resp.status === 403) throw new Error('O Google recusou o download de <b>' + f.name + '</b>. Em geral é cota de tráfego da pasta — tente daqui a pouco.');
    throw new Error('Não consegui baixar <b>' + f.name + '</b> (erro ' + resp.status + ').');
  }

  const total = Number(f.size) || Number(resp.headers.get('content-length')) || 0;
  let blob;
  if (onProgress && total && resp.body && resp.body.getReader) {
    const reader = resp.body.getReader();
    const parts = [];
    let lidos = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value);
      lidos += value.length;
      onProgress(Math.min(1, lidos / total));
    }
    blob = new Blob(parts);
  } else {
    blob = await resp.blob();
  }
  return new File([blob], f.name, { type: f.mimeType || '' });
}
