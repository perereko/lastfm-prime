# Last.fm Hub 2.10

Extensão para Chrome, Edge, Brave e Opera que transforma o Last.fm num hub preto e moderno, no estilo de um app de música.

## Como instalar

1. Extraia o arquivo `lastfm-hub.zip` numa pasta que você não vá apagar (por exemplo, `Documentos\lastfm-hub`).
2. Abra a página de extensões do navegador:
   - Chrome / Brave / Opera: `chrome://extensions`
   - Edge: `edge://extensions`
3. Ative o **Modo do desenvolvedor** (canto superior direito no Chrome; menu lateral no Edge).
4. Clique em **Carregar sem compactação** e escolha a pasta `lastfm-hub` (a que tem o arquivo `manifest.json`).
5. Abra ou recarregue qualquer página do last.fm, **com a sua conta logada**: a barra lateral, o "tocando agora", o painel da página inicial e os seus números nas páginas de artista dependem do login.

Já tinha uma versão anterior? Substitua os arquivos da pasta pelos novos, clique no botão de recarregar do cartão da extensão em `chrome://extensions` e recarregue o Last.fm. As suas configurações continuam.

Dica: fixe o ícone da extensão na barra (ícone de quebra-cabeça → alfinete) para abrir as configurações com um clique.

## Novidades da 2.10

- **Listas suspensas consertadas**: o menu do “Ouvir no…” agora abre por cima de tudo (antes podia ficar atrás das abas e do conteúdo, ou cortado), sobe quando falta espaço embaixo e acompanha a rolagem. A escolha do serviço preferido virou botões, e a afinidade mínima do Premium ganhou uma lista própria: as listas nativas do navegador abriam fora do lugar dentro do app.
- **Premium sempre com 10**: quando uma busca acha poucas bandas inéditas, a extensão busca mais páginas das tags, bandas parecidas com as que entraram e gêneros vizinhos; se ainda faltar, completa com as mais compatíveis com o seu gosto, marcadas como “parecida”.
- **Modo leve**: nova opção sem desfoques e sem mosaicos animados, para computadores modestos.
- Dentro do app Last.fm PRIME, as opções de balões, animações e modo leve também aparecem nas configurações do app.

## Novidades da 2.9

- **Surpreenda-me consertado**: o Last.fm passou a dividir a página Descobrir em vários blocos e o tema só enxergava o primeiro. Agora todas as seções entram no índice, ganham selos e ações, e o sorteio funciona (antes ele dizia que as recomendações ainda estavam carregando e parava aí). “Sortear outro” não repete a última e, clicado duas vezes rápido, para numa só.
- **Premium: “Não quero”**: cada recomendação tem um botão para tirá-la. A banda sai, a próxima mais compatível entra no lugar e ela não volta mais, nem em outras buscas. Dá para desfazer na hora, e o botão **Tiradas** lista todas as que você tirou, com “Mostrar de novo”.
- **Imagens mais leves**: as capas novas só baixam quando chegam perto da tela e são decodificadas sem travar a página; o destaque do painel inicial não baixa mais a foto no tamanho original (que podia ter vários MB).
- **Cache com faxina**: a extensão apaga sozinha o que guardou há mais de 2 semanas e limita a quantidade de itens guardados, para não ficar pesada com o tempo.
- A aba atual do Descobrir também aparece em português (“Visão geral”).

## Novidades da 2.8.1

- Pronta para o app **Last.fm PRIME** (Last.fm e Spotify juntos): os botões “Ouvir no Spotify” agora dizem ao app se é um artista, um álbum ou uma faixa, para ele tocar exatamente o que você clicou. No navegador nada muda: o link abre a busca do Spotify como antes.
- As opções do tema também funcionam onde não há sincronização do navegador (como dentro do app).
- Barras de rolagem escuras em todas as áreas que rolam, inclusive na barra lateral.

## Novidades da 2.8

- **Página Descobrir (last.fm/music) turbinada**:
  - **Topo novo** com saudação pelo seu nome e a contagem do que a página trouxe (álbuns, faixas, artistas, o que está chegando e quantos são de artistas que você já ouve). Ao lado, um **mosaico de capas** da própria página que desliza sem parar, em diagonal, e para quando o mouse passa por cima.
  - **Surpreenda-me**: uma roleta de capas gira e para num álbum ou faixa da página, de preferência de artista que você ainda não ouve e que já saiu. Dali dá para ouvir no seu serviço, guardar no “Ouvir depois” ou sortear outro. Fecha com Esc ou clicando fora.
  - **Esconder o que eu já ouço**: um botão no topo tira da página os cartões de artistas que estão na sua biblioteca. A escolha fica salva.
  - **Navegação por seções**: uma barra de atalhos (Artistas, Lançamentos, Tags, Álbuns, Faixas, Em alta, Em breve, Charts) fica presa no topo, leva até a seção com rolagem suave e marca onde você está.
  - **Prateleiras deslizantes**: lançamentos, álbuns, artistas e tags viram fileiras com setas, com encaixe cartão a cartão e as bordas esmaecendo. Os cartões entram animados conforme aparecem.
  - **Selos nas capas**: “✓ Já ouvido”, “Novo” (saiu nos últimos 7 dias), “Sai hoje”, “Amanhã” e “Em N dias” para o que ainda vai sair.
  - **Ações rápidas nas capas**: ao passar o mouse, um botão abre o álbum ou a faixa no seu serviço (no lugar do “Play” do site) e outro guarda no “Ouvir depois”.
  - **Tudo em português**: títulos das seções, abas do topo, “Parecido com…”, “Você já ouviu…” e as datas (“15 de out. de 2026”).
  - Destaques de artista e de tag com zoom lento no fundo, faixas em colunas com capa pequena, tags e charts em mosaico com zoom ao passar o mouse. A seção “Do fundo do baú”, que é só para assinantes e chega vazia, some.
  - Dá para desligar tudo isso no popup em **Descobrir turbinado**; a página volta a ser a do site.

## Novidades da 2.7

- **PRIME ao lado do logo do Last.fm**:
  - Escrito na fonte Unbounded, em degradê na cor de destaque. Ao abrir a página, a palavra entra se fechando e saindo do desfoque. A cada poucos segundos, um brilho atravessa as letras.
  - Ao lado vai um “by Perereko” pequeno e discreto, com link para https://s2.rip/senhor_perereko (abre em outra aba).
  - Com as animações desligadas no popup, o PRIME aparece parado. Em telas estreitas, só o PRIME aparece.

## Novidades da 2.6

- **Listas suspensas consertadas**:
  - **“Ouvir em” das faixas e das capas** (Spotify, Apple Music, YouTube…): as linhas e capas seguintes não cobrem mais o menu, e o arredondamento da capa não corta mais a lista. O menu também não some quando o mouse sai da capa.
  - **Filtros de tempo** (“Last 7 days”, intervalo de datas da biblioteca, menus dos relatórios): a lista aparece inteira, inclusive as que têm rolagem, e some na hora quando você fecha. Antes ela ficava aberta um instante. No filtro de datas, os atalhos ficaram legíveis, o calendário abre no tema escuro e o botão “Apply” ganhou contraste.
  - **“Ouvir no…” da extensão** e menus do topo da página: o menu não é mais cortado pelo topo, fica por cima do conteúdo e não fica mais transparente quando a página está rolada.
- **Sem o “Play artist” do site**: no topo de artistas, álbuns e faixas fica só o botão “Ouvir no…” da extensão. O mesmo vale para o topo compacto que aparece ao rolar. Se você desligar o “Ouvir no…” no popup, o botão do site volta.

## Novidades da 2.5

- **Mais anúncios escondidos.** Conferi página por página, no Last.fm de verdade, o que ainda escapava:
  - o **player de vídeo flutuante** (Voltax) que aparece no canto da tela;
  - os anúncios no meio das listas de seguindo, recomendações, charts e shows, que viravam um cartão vazio;
  - a faixa de anúncio do rodapé de Destaques (Features);
  - os anúncios automáticos do Google, inclusive os de tela cheia;
  - as chamadas para assinar o Pro na página Música e nos relatórios de audição.
- O bloqueio também ficou mais firme: se um script de anúncio forçar o espaço a aparecer, ele continua invisível e sem receber cliques.
- Os anúncios voltam se você desligar “Esconder anúncios e banners” no popup.

## Novidades da 2.4

- **Recomendações Premium agora giram em torno da busca por gêneros (tags)**:
  - Digite um gênero e aperte Enter ou vírgula para ele virar uma etiqueta, ou clique nos seus gêneros logo abaixo da busca. Dá para juntar até 5 e clicar em **Buscar**. O botão pulsa quando a busca mudou e ainda não foi feita.
  - Cada busca traz **10 álbuns** de bandas em que você nunca teve um scrobble e que não estão nas recomendações do Last.fm.
  - Com várias tags, **vem primeiro quem tem mais tags da busca**. Cada cartão mostra “3 de 3 tags”, “2 de 3 tags” etc., e a lista tem divisórias entre os grupos. Dentro de cada grupo, a ordem vai **da banda mais compatível com o seu gosto à menos**.
  - A compatibilidade junta três coisas: a banda aparecer entre os parecidos dos artistas que você mais ouve, os parecidos dela incluírem artistas que você ouve (“Lembra Mastodon e Gojira, que você ouve”) e as tags dela baterem com o seu perfil de gêneros.
  - Ao abrir a aba sem uma busca sua, ela começa num **gênero da vez**, tirado do seu perfil, que muda a cada visita. **Limpar** mostra as 10 mais compatíveis sem filtro de gênero.
- **Amigos com afinidade alta agora são opcionais** e vêm desligados. Ligue “Somar amigos com afinidade” para incluir o que ouvem as pessoas que você segue com 95% (ou 90, 85, 80%) de afinidade. Com a opção desligada, a extensão nem lê os perfis delas, então a busca fica mais rápida.
- O Catálogo e o Premium passam a dividir o mesmo perfil de gêneros: o que um calcula, o outro aproveita.

## Novidades da 2.3

- **Aba Recomendações Premium** (no menu lateral, ao lado de “Catálogo” no seu perfil e na busca rápida): álbuns de bandas em que você **nunca teve um scrobble**, fora das recomendações do próprio Last.fm.
  - De onde vêm: dos artistas parecidos com os 30 que você mais ouve e do que ouvem, no último ano, as pessoas que você segue com **afinidade de 95% ou mais** no medidor do Last.fm. Antes de entrar na lista, cada banda é conferida: precisa ter álbum, e a página dela não pode mostrar nenhum scrobble seu.
  - **Ranking** do mais provável ao menos provável, com a chance estimada de você gostar. A nota junta quanto a banda se parece com o que você ouve, quantos amigos de gosto parecido a ouvem e quanto as tags dela batem com os seus gêneros. Cada cartão diz o motivo (“Parecido com Opeth e Tool”, “Fulano ouve · 99% de afinidade”), mostra o álbum mais ouvido da banda e, no pódio, o próximo para ouvir depois.
  - **Gênero em foco que muda a cada vez que você abre a aba**: o ranking fica dentro de um dos seus gêneros principais e, embaixo, sem número, entram algumas bandas fora do foco. Dá para trocar o foco à mão ou escolher “Todos”.
  - **Busca por gêneros como tags**: digite um gênero e aperte Enter (ou vírgula) para virar uma etiqueta. Junte quantos quiser (até 5) e clique em Buscar. Aparecem só bandas com pelo menos um deles, e quem tem todos sobe no ranking. Backspace apaga a última etiqueta.
  - **Afinidade de amigos** ajustável (95%, 90%, 85% ou 80%) e **Recalcular** para refazer a coleta na hora.
  - A primeira montagem lê bastante coisa (sua biblioteca, os parecidos, o perfil de quem você segue e a página de cada banda candidata) e pode levar cerca de um minuto. Depois fica guardada por 12 horas e abre em segundos.
- **Telas de carregamento animadas**: enquanto o Premium e o Catálogo são montados, a seção fica desfocada sob um disco girando, as capas dos seus artistas em órbita, as etapas (com a atual pulsando e as prontas marcadas) e uma barra de progresso. As descobertas de cada gênero no Catálogo ganham uma versão compacta, que só aparece se a espera passar de um instante.
- Seguidores e seguindo: os cartões seguem a marcação atual do site (avatar no topo, nome logo abaixo).

## Novidades da 2.2

- **Balões de informação**: pare o mouse sobre qualquer artista, álbum ou faixa do site e aparece um cartão com foto ou capa, ouvintes, scrobbles, quantas vezes você ouviu, tags, um resumo da biografia, data de lançamento e duração (álbuns), faixa mais tocada e artistas parecidos (artistas). Dá para abrir, ouvir no seu serviço ou salvar para depois direto do balão. Ele só abre quando o ponteiro descansa no link, para não piscar ao passar por uma grade de capas; `Esc` ou rolar a página fecha.
- **Seguidores e seguindo como rede social**: cada pessoa vira um cartão com capa, avatar grande, scrobbles, artistas, ano em que começou, o que está ouvindo agora (ou o último scrobble) e a **afinidade** com o seu perfil: a porcentagem e o nível do medidor do próprio Last.fm, com os artistas que vocês dois ouvem. Quando o site não mostra o medidor, a extensão estima comparando os 100 artistas mais ouvidos de cada um (aparece como “estimada”). No topo: filtro por nome e ordenação por afinidade, scrobbles ou quem está ouvindo agora.
- **Busca no centro da tela**: a caixa nasce da pílula de busca, vai para o meio da tela e o resto da página fica desfocado e escurecido. Clicar em qualquer lugar fora da caixa fecha. O campo de busca da página de resultados também abre essa busca.
- **Aba Catálogo** (no menu lateral, ao lado de “Library” no seu perfil e na busca rápida):
  - **Seus gêneros** em ordem decrescente, calculados a partir das tags dos seus artistas mais ouvidos e pesados pelos seus scrobbles, no período que você escolher (7 dias a “Sempre”). Na primeira vez a extensão lê as tags artista por artista, com uma barra de progresso; depois fica guardado.
  - **Ouvir depois**: as faixas, álbuns e artistas marcados nos favoritos (marcadores) do Last.fm, mais o que você salvar pelos balões. Filtra por tipo, abre no seu serviço e tira da lista com um clique.
  - **Descobertas no gênero**: clique num gênero e veja artistas, álbuns e faixas em destaque nele que ainda não estão entre os seus mais ouvidos.
- Corrigido: a busca e o visualizador de capas desfocavam só uma faixa no topo da tela (um conflito de nomes no CSS deixava o fundo com 46px de altura). O contorno de foco que aparecia dentro da caixa de busca também sumiu.

## Novidades da 2.1 (correções visuais)

- A coluna de conteúdo acompanha a largura da janela (até 1720px; no **layout amplo**, até 2560px), sem a faixa vazia enorme em monitores grandes e ultrawide.
- Páginas cuja coluna lateral só tinha anúncios (Shows, Busca, Seguindo, Tags) usam a largura toda.
- Barra de filtro e grade da biblioteca não somem mais ao voltar para a página; artista alinhado embaixo do nome nas listas com barra.
- Ouvintes dos "artistas semelhantes" na lateral não se sobrepõem; tags não são cortadas nem invadem a vizinha.
- Fim dos restos do tema claro e vermelho: calendário dos shows (o dia era branco no branco), linhas cinza-claro da lista de shows, botões vermelhos (seguir, adicionar evento, chamada para taguear), ícones escuros invisíveis (lupa da busca, favoritar, compartilhar, setas de filtro), avatares padrão brancos e o anel branco do selo de assinante.
- Foto do nº 1 nos charts com degradê, para o texto ficar legível em fotos claras.
- Recados (shoutbox) sem caixa dentro de caixa; navegação de /music em pílulas e cantos arredondados nos mosaicos de tags e lançamentos.
- Biografia de artista e de álbum mais larga; nome do artista acima do título do álbum/faixa com contraste total.

## O que muda

**Estrutura de app**
- **Barra lateral fixa** com seu avatar e total de scrobbles, busca, Início, Descobrir, Charts, Shows e a sua música (Perfil, Scrobbles, Artistas, Álbuns, Faixas, Curtidas, Relatórios). Em telas médias ela vira uma coluna de ícones; a tecla `B` recolhe ou expande.
- **Tocando agora** no pé da barra lateral: capa, faixa e artista do seu scrobble atual, com equalizador animado e a cor da capa. Atualiza sozinho a cada 30 segundos.
- **Busca no topo** em formato de pílula, sempre visível.
- **Folha arredondada** para o conteúdo, sobre fundo preto, com um brilho suave da cor da capa ou foto da página.

**Página inicial**
- Saudação ("Boa tarde, Gab") e um painel com: o que está tocando, scrobbles da semana, total, seus 5 artistas da semana com barras e um cartão grande com o artista mais ouvido.
- Recomendações em cartões com capa grande e selo do tipo (Faixa, Artista, Álbum, Show).

**Artista, álbum e faixa**
- Topo em tela cheia com a foto ao fundo, título grande e números (incluindo **Seus scrobbles**).
- Em álbuns e faixas, a capa sobe para o topo, ao lado do título; clique nela para ver em alta resolução.
- **Ouvir no Spotify** (ou no serviço escolhido no popup) com menu para YouTube Music, Apple Music, Deezer, Tidal, YouTube, SoundCloud, letra no Genius, notas no RateYourMusic, Wikipédia e copiar nome ou link.
- **Abas de seções** logo abaixo do topo: Faixas, Álbuns, Fotos, Semelhantes, Shows, Biografia, Tags, Ouvintes e "Na sua biblioteca".
- **Topo compacto**: ao rolar, uma barra de vidro mostra capa, título, play e "Ouvir no".

**Perfil e biblioteca**
- Cabeçalho do perfil com o nome em letras grandes e cartões de ritmo: média por dia e por mês, há quanto tempo você scrobbla e estimativa de dias de música.
- **Filtro instantâneo** e **modo grade** (mosaico de capas, sem precisar do Pro) nas listas da biblioteca; a escolha fica salva por tipo de página.
- Relatórios, charts e busca ajustados ao tema escuro e à largura da tela.

**Busca rápida** (`Ctrl+K` ou `/`)
- Resultados enquanto você digita, com filtros Tudo / Artistas / Álbuns / Faixas / Ações (`Tab` alterna).
- Painel de prévia com a capa ou foto grande do item selecionado.
- `Enter` abre, `Ctrl+Enter` abre em nova aba, `Alt+Enter` abre direto no seu serviço de música.
- Sem digitar nada, mostra as páginas visitadas recentemente.

**Animações**
- Troca de página com a imagem do topo entrando em foco e o título subindo.
- O topo recua e desfoca enquanto você rola; capas, cartões e linhas surgem ao entrar na tela; barras de contagem crescem.
- Tudo respeita a opção "reduzir movimento" do sistema e pode ser desligado no popup.

**Atalhos**
- `Ctrl+K` ou `/` busca · `G` depois `P` perfil, `L` scrobbles, `R` relatório da semana, `H` início, `C` charts · `F` filtra a lista · `B` barra lateral · `W` layout amplo · `?` lista de atalhos · `Esc` fecha janelas.

## Popup

Liga e desliga o tema, escolhe a cor de destaque (automática pela capa ou fixa), o serviço preferido do botão "Ouvir no" e cada recurso separadamente. Mostra também com qual conta do Last.fm você está conectado.

## Privacidade

A extensão não coleta nem envia dados para lugar nenhum. Ela lê só páginas do próprio last.fm (as mesmas que você abre, a lista dos seus scrobbles recentes e da semana para o painel e o "tocando agora", a página de quem aparece nos balões e nas listas de seguidores, as páginas de tags para o Catálogo e, no Premium, as páginas de artistas parecidos, das tags buscadas e das recomendações do Last.fm (a lista de quem você segue e o perfil e a biblioteca dessas pessoas só com a opção de amigos ligada) e, no Descobrir, a lista de artistas da sua biblioteca, para marcar o que você já ouve; com uma fila de no máximo 4 pedidos por vez e cache) e as imagens do servidor do Last.fm, para calcular a cor das capas. As configurações ficam na sua conta do navegador; o histórico da busca e os dados do painel ficam só neste computador. As fontes Geist e Unbounded vêm do Google Fonts; sem internet, o tema usa as fontes do sistema.

## Se algo parecer errado

O Last.fm muda o próprio layout de vez em quando. Se alguma parte ficar estranha, desligue o tema no popup para ver a página original, ou desative só o recurso específico.
