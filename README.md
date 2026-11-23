# Treine no Lar — Treinos guiados em casa

Aplicativo independente de treino em casa, com plano semanal de força e cardio, cronômetro, acompanhamento da evolução e controle opcional de músicas no Spotify. É uma evolução do antigo VIVA, que foi removido da publicação do portfólio.

Versão pública: https://treinenolar.vinmedrado.com/. Consulte [MIGRACAO.md](./MIGRACAO.md) apenas para instruções históricas sobre a migração.

Aplicativo de treinos em casa com plano semanal de força e cardio, cronômetro, acompanhamento local e funcionamento offline. As recomendações são calculadas por regras explícitas; **não há IA generativa nem avaliação de movimentos por câmera**.

## Publicação

- Endereço planejado após a migração: **https://treinenolar.vinmedrado.com/**
- Repositório atual: [`vinmedrado/treine-no-lar`](https://github.com/vinmedrado/treine-no-lar), arquivos na raiz
- Código transferido para a branch `main`. Publicação ainda depende de habilitar o GitHub Pages, configurar DNS/HTTPS e cadastrar o Redirect URI do Spotify. O portfólio atual permanece intacto.

## Funcionalidades da versão completa

- **Biblioteca de 365 sequências de referência**: 73 semanas com cinco dias por semana, consultáveis em 37 páginas. São combinações para consulta, **não 365 prescrições independentes**. O plano semanal preserva exercícios principais ao longo dos ciclos, e há aproximadamente 260 dias de segunda a sexta em um ano.
- **Plano semanal**: segunda a sexta, com três dias de força e dois dias opcionais de cardio/mobilidade, aquecimento e volta à calma.
- **Treino de força com prescrição própria**: exercícios de agachar, puxar, empurrar, quadril e estabilidade; 2–3 séries por movimento, 8–12 repetições orientativas, pausas de aproximadamente 55–100 segundos e controles por grupo muscular. O cronômetro disponibiliza uma janela para cada série, mas **não conta as repetições automaticamente**.
- **Cardio em intervalos próprios**: alterna movimento e recuperação, com intensidade adaptada ao início e às semanas seguintes. A versão de 20 minutos tem 5 minutos de aquecimento, 10 de circuito e 5 de volta à calma; 30 minutos têm 5/20/5, e 45 minutos têm 7/30/8.
- **Registro aeróbico gradual**: painel distingue minutos de cardio com esforço autorrelatado e caminhadas moderadas registradas, com referências semanais progressivas. Não usa minutos de musculação para alegar que uma meta aeróbica foi atingida.
- **Adaptação gradual**: sessões de 20 minutos no início; 30 e 45 minutos são sugeridos apenas conforme frequência, recuperação, esforço relatado e tempo de adaptação.
- **Avaliação diária de prontidão**: antes de iniciar, o usuário informa energia, sono e desconfortos. O sistema pode manter a sessão, propor recuperação ativa de 20 minutos ou recomendar não treinar em caso de sinais de alerta. Sem diagnóstico médico.
- **Progressão por exercício**: a meta de repetições usa duas sessões completas em dias diferentes, com séries registradas, execução controlada e avaliação de esforço; dor e recuperação insuficiente bloqueiam aumentos. Trocar para elástico mais forte é uma sugestão opcional.
- **Número de séries**: nos treinos de 30 minutos, pode passar de duas para três séries após oito dias de força registrados com segurança, a partir da semana 5. Sessões de 20 minutos mantêm duas séries.
- **Substituições por padrão de movimento**: as alternativas respeitam o padrão do exercício, equipamentos e restrições. Quando não há equivalente adequado, o movimento não é substituído automaticamente.
- **Ciclos de quatro semanas** com revisões de hábitos, tendência de peso, técnica e tolerância à resistência. Alguns exercícios básicos permanecem para acompanhar força.
- **Mini bands e elásticos** opcionais e seleção de baixo impacto.
- **Substituições compatíveis**: escolha de alternativas por equipamento, restrições para exercícios no chão e apoio dos joelhos, motivo da troca e opção de reverter em Ajustes.
- **Instruções técnicas em texto**: 31 exercícios com objetivo, músculos trabalhados, equipamento, execução, erros comuns, versão mais fácil e progressão. As imagens esquemáticas e o mascote foram removidos por falta de precisão visual.
- **Cronômetro e áudio**: anúncios em pt-BR (validado pelo usuário no iPhone), bipes, contagem final, avanço manual, pausa e retomada.
- **Proteção da integridade das sessões**: avançar manualmente grande parte da sessão impede o registro de conclusão. Ao sair do Safari, a sessão é pausada e pode ser retomada após recarregar.
- **Registro manual de séries**: botão para concluir cada série de força, informar repetições realizadas, resistência, esforço e técnica. Séries sem registro manual não entram na contagem de repetições.
- **Acompanhamento**: check-ins semanais, feedback pós-treino, pesagens, gráfico de oito semanas, comparações de repetições por exercício e histórico de força.
- **Offline**: service worker guarda os arquivos principais após uma primeira visita com internet. O suporte em segundo plano e à voz depende do navegador e do sistema.
- **Backup**: exportação e restauração validada de arquivo JSON, incluindo histórico, pesagens, professor, substituições, caminhadas e modalidade dos treinos.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Interface, navegação, treinos, cronômetro e progressos |
| `coach.js` | Biblioteca de 365 combinações, intensidade, ciclos e recomendações |
| `evolution.js` | Prontidão diária, recuperação ativa, progressão de força e leitura integrada de peso/cintura |
| `evolution-ui.js` | Formulário diário, avaliação pós-treino e cartões de força |
| `training.js` | Protocolos separados de força e cardio, distribuição muscular e aquecimento/volta à calma |
| `guide.js` | Guias de execução de 31 exercícios |
| `exercises.js` | Catálogo de exercícios, restrições, alternativas e séries informadas manualmente |
| `backup.js` | Exportação, validação e restauração dos registros |
| `sw.js` | Cache e funcionamento offline |
| `manifest.webmanifest` | Configuração de aplicativo web instalável |
| `favicon.svg` | Ícone do Treine no Lar |
| `qa.js`, `qa.html` | Bateria independente de regressão (137 verificações) |

Após publicar, o QA ficará em **https://treinenolar.vinmedrado.com/qa.html**.

## Segurança, limitações e privacidade

**Interface:** rótulos descritivos, navegação por Início, Plano, Avulso, Progresso e Ajustes. Linguagem direta, sem nomes de personagens inventados nem promessas de resultados automáticos.

**Exclusão de treinos:** o comando em Ajustes apaga o histórico de sessões e suas avaliações de força associadas, mantendo pesagens, caminhadas e configurações. Faça backup antes de limpar registros.

O Treine no Lar oferece orientações gerais calculadas por regras, não uma avaliação clínica ou acompanhamento presencial de um profissional de Educação Física. A avaliação diária é autorrelatada, não mede sinais vitais ou condições médicas; dor incomum, sintomas preocupantes e dor muscular intensa exigem precaução. Em caso de sintomas intensos ou súbitos, procure atendimento imediato. Não diagnostica lesões, não determina uma dieta individual e não garante uma taxa de emagrecimento. O plano de força/cardio segue princípios gerais de atividade física e adaptação gradual, não é uma prescrição individual.

Os registros pessoais são salvos localmente no dispositivo pela chave `viva-functional-v2`; não existe backend, login ou sincronização automática entre celulares. Há também uma chave de sessão temporária para recuperação do treino. Limpar o armazenamento do navegador pode apagar os dados. Guarde o backup JSON em local privado, pois ele contém informações de saúde e treino e **não é criptografado**.

No iPhone, a voz e o cronômetro podem não continuar funcionando com a tela apagada; por isso o aplicativo pausa a sessão quando vai para segundo plano. Os guias são textuais. Não há detecção automática de postura, contagem por câmera ou avaliação médica.

## Fundamentos consultados

- [American College of Sports Medicine (2026): Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance](https://doi.org/10.1249/MSS.0000000000003897)
- [Organização Mundial da Saúde: recomendações para adultos sobre atividade física](https://www.who.int/europe/news-room/fact-sheets/item/physical-activity)

## Desenvolvimento e publicação

Aplicativo estático, sem dependências de build. Os arquivos desta pasta são publicados por GitHub Pages. Atualizar o repositório independente não altera o portfólio. O novo endereço exige GitHub Pages, DNS e Spotify Redirect URI configurados.

## Música durante o treino — Spotify Premium

### Playlist oficial pública
Acesse **Música → Ouvir playlist** para abrir o player oficial da playlist do Treine no Lar, mesmo sem estar autorizado no app Spotify em Development Mode. Também é possível abrir no Spotify: https://open.spotify.com/playlist/5YemM9AtFz0kVteTl0x4ZH. A reprodução completa depende das condições do Spotify e da conta do visitante; sem login pode haver apenas prévias. O player oficial não recebe tokens OAuth do painel de conexão pessoal.

O Treine no Lar oferece um painel de música que permanece montado enquanto o cronômetro muda de exercício. Há duas modalidades:

- **Player oficial**: em Início, toque em **Música**, cole um endereço `https://open.spotify.com/playlist/...`, salve e abra o player oficial. Não exige Client ID. O comportamento de reprodução completa é determinado pelo Spotify e pelo Safari.
- **Controle Premium (Web Playback SDK)**: permite autenticar uma conta Premium, listar até 30 playlists disponíveis e controlar reproduzir/pausar, faixa anterior e próxima dentro do Treine no Lar, respeitando as limitações do navegador e as permissões da API.
- **Spotify — player móvel refeito**: barra compacta fixa, com nome da música e artista, e painel de altura limitada (até 485 px) para não cobrir a tela inteira. A lista de playlists possui cartões responsivos com nomes em até duas linhas, sem rolagem horizontal. A capa oficial aparece quando há faixa identificada. A linha animada inspirada em gráfico financeiro é **decorativa**, só se movimenta quando a reprodução está ativa e respeita a preferência do sistema por redução de movimento.
- **Playlists em cards**: um toque seleciona e inicia a reprodução quando o player já está ativo; a playlist ativa é destacada. Tocar novamente na mesma playlist que já toca não reinicia sua música.
- **Faixa atual confiável**: informações vêm de `player_state_changed` (SDK) e do estado atual de reprodução (`GET /me/player`) quando necessário. As capas exibidas vêm apenas de domínios de imagens confiáveis do Spotify; títulos e nomes são escapados antes de serem exibidos.
- **Acessibilidade e bateria**: botões com rótulos, cores de alto contraste e animação desativada se o sistema operacional solicitar redução de movimento; sincronização leve enquanto a página estiver visível.

### Configurar o Spotify Premium

1. Abra [Spotify for Developers](https://developer.spotify.com/dashboard) com uma conta Premium e crie um app autorizado para **Web Playback SDK**.
2. Cadastre exatamente `https://treinenolar.vinmedrado.com/` como **Redirect URI** (HTTPS, com barra final). Adicione sua conta aos usuários permitidos se o dashboard solicitar.
3. O **Client ID público já está configurado no Treine no Lar**. Abra **Música** e toque em **Conectar Spotify Premium**. Não é necessário inserir um Client Secret.
4. Toque em **Conectar Spotify Premium**, autorize sua conta, depois em **Ativar player** e escolha uma playlist com um toque. A playlist selecionada passa a tocar; se o Safari bloquear autoplay, toque no botão central de reprodução.

O Client ID é um identificador público distribuído no código da página; o navegador pode guardar um ID alternativo se você personalizar a configuração. A autenticação utiliza Authorization Code com PKCE, sem servidor e sem Client Secret. Tokens são guardados no `sessionStorage` do navegador e **não entram no arquivo de backup do Treine no Lar**. Sair do navegador ou trocar entre PWA e Safari pode exigir uma nova conexão. O SDK precisa de internet; o modo offline do Treine no Lar não permite ouvir Spotify offline pelo site.

**Limites atuais da plataforma (novembro de 2026)**: apps novos em Development Mode exigem Premium do proprietário, permitem até cinco usuários autenticados por app, e o limite de criação foi ampliado para até 25 Client IDs por conta de desenvolvedor em julho de 2026. Não anuncie a integração como disponível a qualquer visitante do portfólio. O Spotify Web Playback SDK não pode ser usado em projetos comerciais sem autorização da plataforma. A música não pode ser alterada ou sincronizada com vídeo pelo aplicativo. Consulte a [documentação oficial](https://developer.spotify.com/documentation/web-playback-sdk) e as [regras de desenvolvimento de fevereiro de 2026](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide).

**Revisão visual para iPhone (novembro de 2026):** removidos estilos conflitantes de versões anteriores; cabeçalho compacto, painel com rolagem apenas vertical, formulário de link e configuração técnica recolhidos, atalho de música duplicado ocultado quando o player compacto já está disponível. A validação visual em Safari/Chrome iOS deve ser feita no aparelho; testes automatizados não substituem essa conferência.

## Interface 2.0 e contador de acessos

A interface possui barra lateral no desktop, navegação inferior no celular e um painel inicial com hierarquia de leitura clara. O design está no arquivo `theme-v2.css`, sem fontes nem imagens externas.

O indicador discreto do cabeçalho usa `site-visits.js` e a API pública de https://counterapi.com/. Trata-se de **acessos registrados após a instalação**, não de visitantes únicos ou pessoas online. Uma aba contabiliza no máximo uma vez por sessão; falhas ocultam o indicador e não inventam números. O serviço recebe os metadados normais de uma requisição HTTPS (como IP) e informa usar anonimização, sem receber dados de treino ou tokens do Spotify. Como o aplicativo continua estático no GitHub Pages, a contagem depende deste serviço de terceiros.

## V3 — Interface editorial

A página inicial segue a referência visual aprovada: hero azul com fotografia real, navegação horizontal no desktop e inferior no celular, quatro atalhos, treino sugerido usando dados reais, circuitos 20/30/45 minutos, gráfico de sessões reais dos sete dias anteriores e Spotify integrado. As regras de negócio e dados locais continuam intactos.

**Fotografias licenciadas (Pexels):** [Kampus Production](https://www.pexels.com/photo/a-woman-doing-exercise-while-recording-herself-8173441/) e [MART PRODUCTION](https://www.pexels.com/photo/man-exercising-at-home-8846442/). As imagens carregam do CDN do Pexels quando há conexão; o restante do aplicativo preserva o modo offline. CSS em `theme-v3.css`.

## V4 — Movimento cinematográfico e áudio discreto

Camada de CSS `motion-v4.css` e aprimoramento progressivo `motion-v4.js`. O player do Spotify é reposicionado como pílula azul discreta no canto inferior direito do desktop; no celular permanece acima da navegação inferior. A paleta verde foi substituída por variações de azul na interface, sem alterar autenticação, playlists, tokens, SDK ou controles de reprodução.

O hero usa entrada sequencial de tipografia, fotografia revelada por cortina, reflexos de luz e destaque do CTA. Os cartões têm entrada coreografada, os programas apresentam interação mais forte, e o gráfico de evolução anima somente valores reais. Elementos abaixo da dobra só são revelados quando visíveis, usando `IntersectionObserver` quando suportado. Com `prefers-reduced-motion: reduce`, os movimentos ficam desativados e todo o conteúdo permanece acessível. As animações não usam cookies nem serviços externos.

## V5 — Cinematografia e interatividade

Revisão do motion design com entrada sequencial em duas linhas, fotografia revelada por uma transição vertical, parallax limitado ao hero no desktop, rastro de leitura durante a rolagem e revelações específicas para cada seção. Cards de programas usam profundidade 3D com ponteiro no desktop e microinteração de toque no CTA. O gráfico usa somente os registros reais. Nenhuma animação reproduz áudio, altera o cronômetro, o Spotify ou solicita dados externos.

Os arquivos `motion-v5.css` e `motion-v5.js` substituem a camada V4 e preservam a identidade azul do player de música. Em `prefers-reduced-motion: reduce`, não há animações, efeitos 3D nem ocultação das seções. Sem IntersectionObserver/MutationObserver, a página continua legível. O service worker versionado atualiza os dois arquivos de forma offline-first.

## V6 — Tipografia e imagens

Acabamento editorial com pesos tipográficos moderados, espaçamento explícito entre "Treine" e "no Lar", selo "MOVIMENTO EM QUALQUER LUGAR" posicionado acima dos quatro atalhos sem colisões e título com respiro suficiente entre as linhas.

A fotografia secundária nunca é ocultada pelo sistema de animações de rolagem: conteúdos ficam visíveis por padrão e recebem uma breve animação ao entrar na tela. Caso a foto original do Pexels falhe, o aplicativo tenta outra foto real de exercícios em casa e, se também falhar (inclusive offline), apresenta um placeholder integrado à identidade azul. Nenhum script externo foi acrescentado. Versões 2 dos estilos e controlador V5 atualizadas no cache do PWA.

## V7 — Tipografia editorial

O desenho das letras deixa de depender da Segoe UI para adotar uma identidade esportiva: títulos e marca em **Barlow Condensed** (600/700), texto funcional em **IBM Plex Sans** (400/500/600). A composição e os textos do aplicativo permanecem iguais. As fontes são servidas pelo Google Fonts com `display=swap`; em caso de indisponibilidade ou uso offline sem cache, há fallback para fontes locais. As fontes não estão incluídas no repositório nem são armazenadas no Service Worker, que continua cacheando somente os recursos da aplicação. CSS em `typography-v7.css`.
