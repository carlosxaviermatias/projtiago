# Avisos de visita do ACS: só quem ainda dá tempo de buscar

## Contexto

Na última mudança, os cards/listas "Visita ACS · 30 dias" e "Visita ACS · 6 meses"
(em `admin/pacientes.html`) passaram a mostrar dois grupos misturados: quem ainda
está **dentro do prazo** e quem já **venceu** o prazo (marcado como "vencida").

Você apontou que isso não serve pra o que você realmente precisa: essas listas são
pra **busca ativa** — avisar a tempo de agir. Uma vez que o prazo venceu (ex.: a
visita de 30 dias não foi feita e a criança já passou dos 30 dias de vida), não
adianta mais te mostrar isso aqui, porque **não dá mais pra alimentar o indicador**
— o dado já era. Mostrar isso só polui a lista sem ajudar em nada prático.

Importante: isso é só sobre **esses avisos de busca ativa**. A pontuação geral da
criança, o status "em risco" no checklist e o mapa de critérios continuam
considerando normalmente que aquele critério não foi cumprido — isso não muda,
só a lista de "quem eu preciso correr atrás agora" some quando já é tarde demais.

## O que vai mudar

Em `admin/pacientes.html`, dentro de `telaVisao()` (cards + tabelas) e
`telaLista()` (filtros `FILTRO_STATUS='acs30d'`/`'acs6m'` + selos por criança):

**Visita até 30 dias**
- Passa a considerar só `vis30d === 0 && idade <= 30` (janela ainda aberta).
- Quem já passou de 30 dias sem a visita **sai da lista/card/selo** — não aparece
  mais como "vencida" em lugar nenhum dessas telas.

**Visita aos 6 meses**
- Passa a considerar só `vis6m === 0 && idade >= inicio6m && idade <= fim6m29d`
  (já completou 6 meses, mas ainda não passou do prazo máximo de 6m e 29d).
- Quem já passou do `fim6m29d` sem a visita **sai da lista/card/selo** da mesma
  forma.

**Nos dois casos:**
- O texto "X vencida(s)" some dos cards (não faz mais sentido, já que vencida não
  aparece). Mantenho um destaque pra quem está **perto de vencer** (ex.: últimos
  7 dias de prazo) usando a cor vermelha, e o resto em âmbar — só que agora tudo
  que aparece ainda é, por definição, "dá tempo de agir".
- As tabelas dedicadas ("Visita do ACS até 30 dias — pendente" / "...aos 6
  meses — pendente") só listam quem está na janela; a coluna de prazo sempre
  mostra dias restantes (nunca "vencido", porque isso não entra mais na lista).
- Os filtros clicáveis (`FILTRO_STATUS`) e os selos na lista de crianças usam a
  mesma regra — ficam consistentes com os cards.

**O que NÃO muda:**
- `avaliar()` / `item()` / pontuação / status "em risco" da criança — o critério
  continua marcado como não cumprido pra fins de pontuação e do mapa de
  critérios, só não entra mais nos avisos de busca ativa depois de vencido.

## Arquivo afetado

- `admin/pacientes.html` — mesmas três áreas já tocadas na mudança anterior:
  `telaVisao()` (cards + tabelas `pendentes30d`/`pendentes6m`), `telaLista()`
  (filtros `acs30d`/`acs6m` e o selo por linha).

## Verificação

1. Rodar local com os dados reais (mesmo fluxo: `DADOS_DIR` temporário + import
   do CSV via curl) e conferir no console que os totais dos cards batem com uma
   contagem manual filtrando só quem está dentro da janela.
2. Confirmar visualmente que nenhuma criança com prazo vencido aparece mais nos
   dois cards, nas duas tabelas, nos filtros ou nos selos da lista — mas que ela
   continua contando normalmente como pendente na pontuação geral e no mapa de
   critérios (isso não deve ter mudado).
3. Subir pro GitHub e confirmar em produção que os 108 pacientes continuam
   intactos.
