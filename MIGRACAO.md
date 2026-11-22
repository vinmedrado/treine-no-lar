# Migração do antigo VIVA para Treine no Lar

## Estado confirmado
- Novo repositório **criado e preenchido**: [vinmedrado/treine-no-lar](https://github.com/vinmedrado/treine-no-lar), branch `main`.
- Aplicativo antigo preservado em [vinmedrado/portfolio/viva](https://github.com/vinmedrado/portfolio/tree/main/viva) e disponível em https://vinmedrado.com/viva/.
- Subdomínio desejado: **https://treinenolar.vinmedrado.com/**.
- Arquivo `CNAME` já incluído na raiz do novo repositório; **não significa que o DNS ou o HTTPS estejam configurados**.
- Verificações automáticas de regras do aplicativo: **137/137 aprovadas** durante a transferência. Testes em navegadores reais e na hospedagem ainda pendentes.

## 1. Habilitar o GitHub Pages
No novo repositório, acesse `Settings → Pages`. Em *Build and deployment*, selecione `Deploy from a branch`, branch `main`, pasta `/ (root)` e salve. A publicação pode depender das configurações do repositório/conta.

## 2. Configurar DNS e HTTPS
No provedor DNS de `vinmedrado.com`, crie/valide um registro `CNAME` para o host `treinenolar` com destino `vinmedrado.github.io`. Após a propagação, valide em `Settings → Pages` se o domínio personalizado `treinenolar.vinmedrado.com` é reconhecido e habilite `Enforce HTTPS` quando disponível. O arquivo `CNAME` na raiz já contém `treinenolar.vinmedrado.com`.

Não declare o domínio como ativo antes de conseguir abri-lo com HTTPS e validar os arquivos JS.

## 3. Spotify
No [Spotify for Developers](https://developer.spotify.com/dashboard), adicione exatamente `https://treinenolar.vinmedrado.com/` na lista autorizada de Redirect URIs, **mantendo a URL antiga** enquanto o VIVA antigo ainda estiver em uso.
A variável REDIRECT no novo `spotify.js` deriva da URL de hospedagem; não há Client Secret.
Teste login, ativação do player, playlist, pausa e retomada no navegador após a publicação.

## 4. Preservar dados pessoais
O VIVA armazena registros no `localStorage` de `vinmedrado.com`; o novo subdomínio é uma origem diferente, portanto **não há migração automática de dados**.
Antes de deixar o site antigo, abra https://vinmedrado.com/viva/ e acesse `Ajustes → Exportar backup`.
No site novo, acesse `Ajustes → Restaurar backup` e selecione esse JSON.
O arquivo exportado contém histórico, avaliações e medidas pessoais em texto simples: guarde-o com cuidado e não envie ao GitHub.
As chaves internas `viva-functional-v2` e `viva-backup-v1` são mantidas intencionalmente para permitir importar registros antigos.

Não coloque redirecionamento automático na página antiga enquanto houver usuários que precisem exportar seus dados.

## 5. Segurança e testes
- O cache PWA novo ignora navegações OAuth com `code`, `state` e `error`.
- Dados locais são normalizados na inicialização; nomes e descrições dos passos recuperados são escapados na interface.
- Treino avulso respeita alertas de prontidão já registrados, sem dispensar avaliação médica/profissional.
- Tokens Spotify ficam no `sessionStorage` e não são exportados no backup.
- Execute `qa.html` no navegador e valide manualmente treino de 20/30/45 minutos, pausa, voz no iPhone, PWA, backup e Spotify.

## 6. Atualização do portfólio
Somente após a publicação validada, atualize os links públicos do projeto no portfólio. O endereço antigo deve continuar acessível até concluir a migração dos históricos.
