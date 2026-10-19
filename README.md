# FitPro

App Android (e iOS) de academia com um personal trainer virtual: faz a anamnese, monta o treino da semana, explica por que cada exercício foi escolhido e mostra um GIF de execução com instruções e erros comuns.

> As recomendações são orientações gerais e não substituem o acompanhamento de um profissional de educação física ou de um médico.

## Stack

Expo SDK 57 (React Native 0.86, nova arquitetura), TypeScript 6 em modo estrito (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), React Navigation 7, FlashList 2, Reanimated 4, expo-image, expo-haptics, expo-keep-awake, TanStack Query, Zustand, expo-sqlite, MMKV 4 e Zod 4. Monorepo com pnpm + Turborepo.

## Estrutura

```
apps/mobile                 app Expo: só navegação, providers e "fiação" entre features
apps/backend                proxy e cache do catálogo da ExerciseDB
packages/core-types         tipos de domínio, rótulos em português, assertNever
packages/core-theme         tokens (grade de 8pt, cores claro/escuro, tipografia)
packages/core-ui            Text, Button, Card, Chip, Skeleton, AnimatedGif…
packages/platform-storage   SQLite (histórico, cache do catálogo) + MMKV (preferências)
packages/feature-onboarding anamnese em 6 etapas + PAR-Q, tela de perfil
packages/feature-exercises  cliente da API + Zod, tradução, catálogo, detalhe com GIF
packages/feature-trainer    motor de recomendação (funções puras), Hoje, Treinos, Trocar
packages/feature-workout    execução: registro de séries, timer de descanso, tela acesa
packages/feature-progress   histórico, gráfico de carga, sequência de dias
```

As dependências só apontam para baixo (`apps → feature → platform → core`) e cada pacote expõe apenas o `src/index.ts` (campo `exports` no `package.json`, então imports profundos nem resolvem). Features não importam umas às outras: quando uma tela precisa de dados de duas features (ex.: o treino em execução usa o plano do trainer e o histórico do storage), quem junta é o `apps/mobile`.

## Setup

Requisitos: Node 22.18+ (o backend roda TypeScript direto no Node), pnpm via Corepack, Android Studio ou um aparelho Android.

```bash
corepack enable
pnpm install
```

### Variáveis de ambiente

**Backend** (`apps/backend/.env`, copie de `.env.example`):

| Variável | Descrição |
| --- | --- |
| `EXERCISE_SOURCE` | `exercisedb-free` (padrão, sem chave) ou `rapidapi` (plano pago). |
| `EXERCISEDB_API_KEY` | Só para `rapidapi`: chave da ExerciseDB na RapidAPI. Fica só no servidor. |
| `EXERCISEDB_HOST` | Só para `rapidapi`. Padrão `exercisedb.p.rapidapi.com`. |
| `PORT` | Padrão `8787`. |
| `PUBLIC_BASE_URL` | URL pela qual o app enxerga o backend; usada nos links de GIF da RapidAPI. No emulador Android: `http://10.0.2.2:8787`. |
| `CATALOG_CACHE_FILE` | Onde o catálogo baixado fica salvo. Padrão `.cache/catalog.json`. |

**App** (`apps/mobile/.env`):

| Variável | Descrição |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | URL do backend. Tudo que começa com `EXPO_PUBLIC_` vai embutido no app, então aqui só entra a URL pública do proxy, nunca a chave. |

### Rodando

```bash
pnpm backend          # terminal 1: proxy em http://localhost:8787
pnpm mobile           # terminal 2: Metro
```

O app usa módulos nativos que não existem no Expo Go (MMKV via Nitro Modules), então rode num **development build**:

```bash
cd apps/mobile
npx expo run:android          # build local, precisa do Android SDK
# ou, sem Android Studio:
npx eas-cli build --profile development --platform android
```

Depois de instalar o dev build, `pnpm mobile` basta para recarregar o JS.

### Pelo Android Studio (celular no cabo USB)

Mantenha o projeto num caminho curto (ex.: `C:\Dev\fitpro`): caminhos longos no Windows quebram o Gradle.

1. `corepack pnpm install` na raiz.
2. Gere o projeto nativo: em `apps/mobile`, `npx expo prebuild --platform android`. A pasta `android/` não vai para o Git, então refaça isso depois de mudar `app.json` ou adicionar módulo nativo.
3. No Android Studio, **File → Open → `apps/mobile/android`** (não a raiz do monorepo) e espere o Gradle sincronizar.
4. No celular, ative **Opções do desenvolvedor → Depuração USB** e ligue o cabo. Aceite a chave RSA que aparece na tela.
5. Num terminal, `pnpm backend`; em outro, em `apps/mobile`, `npx expo start --dev-client`.
6. Redirecione as portas pelo cabo (assim o celular não depende do Wi-Fi):

   ```bash
   adb reverse tcp:8081 tcp:8081
   adb reverse tcp:8787 tcp:8787
   ```

   Com isso, `EXPO_PUBLIC_API_URL=http://localhost:8787` em `apps/mobile/.env` funciona no celular. No emulador, use `http://10.0.2.2:8787`. O `adb reverse` some quando o cabo é desconectado; rode de novo ao reconectar.
7. Escolha o celular na barra do Android Studio e clique em **Run ▶**.

### Testes, checagem de tipos e CI

```bash
pnpm test        # motor de recomendação, adaptador da API, estatísticas de progresso
pnpm typecheck   # todos os pacotes e apps
```

O workflow `.github/workflows/ci.yml` roda os dois a cada push na `main` e em pull requests.

## Como funciona o personal

Tudo em `packages/feature-trainer/src/engine`, como funções puras e testadas.

- **Divisão**: 2–3 dias → full body; 4 → superior/inferior; 5–6 → push/pull/legs. Sessões repetidas na semana (A, B) alternam entre os 3 melhores candidatos de cada slot.
- **Seleção**: cada sessão tem slots (músculo + papel). O slot principal prefere compostos; acessórios preferem isolados. Filtra por equipamento disponível e nível (nunca acima do nível do usuário).
- **Restrições**: `restrictions.ts` lista padrões a evitar e a preferir por articulação. Lombar evita terra convencional, good morning e remada curvada com barra, e prefere hip thrust e máquinas apoiadas. Joelho evita agachamento profundo/pistol/saltos. Quando o favorito é contraindicado, a escolha vira uma substituição com motivo ("Substitui Levantamento terra para não sobrecarregar a lombar…").
- **Prescrição**: força 3–6 reps / 150 s no principal (acessórios 6–10 / 90 s); hipertrofia 6–12 / 60–90 s; resistência 12–20 / 30–60 s; emagrecimento 10–15 / 45 s; saúde 8–12 / 60 s. Iniciante faz uma série a menos e RPE um ponto abaixo.
- **Tempo**: acessórios são cortados do fim até a sessão caber nos minutos escolhidos (aquecimento de 5 min incluso).
- **Progressão**: topo da faixa em todas as séries por 2 sessões seguidas → +5% (compostos e membros inferiores) ou +2,5% (isolados), mínimo de 0,5 kg. 2 sessões abaixo da faixa → manter; 3 → reduzir 10%.
- **Trocar exercício**: até 3 alternativas seguras para o mesmo músculo, priorizando o mesmo equipamento.
- **Clássicos primeiro** (`familiarity.ts`): o catálogo real tem dezenas de variações por músculo. O motor prefere os movimentos clássicos de cada músculo (supino, remada, agachamento, mesa flexora…), penaliza variações exóticas (pegada invertida, "on knees", levantamentos olímpicos) e nunca repete o mesmo nome na sessão, já que o catálogo tem nomes duplicados com IDs diferentes.

## Bonequinhos animados

Cada exercício é demonstrado por um bonequinho desenhado pelo próprio app (`packages/core-ui/src/figure` + `ExerciseFigure`), não por GIF: funciona offline, não depende da licença das animações da ExerciseDB e deixa o APK menor.

- **19 padrões de movimento** (supino, remada, agachamento, terra, leg press…). O adaptador escolhe o padrão pelo nome do exercício (`feature-exercises/src/api/movement.ts`) e, sem termo conhecido, pelo músculo-alvo; todo exercício tem animação.
- **Poses por ângulos das articulações** com cinemática direta, e **pé plantado** com cinemática inversa nos movimentos de perna: os ossos nunca esticam e o pé não atravessa o chão. Um teste confere os 19 movimentos.
- **O equipamento muda com o exercício**: anilha (barra), halter, kettlebell, cabo com polia, elástico, almofada no tornozelo (extensora, flexora, leg press).
- Animação no thread de UI com Reanimated + `react-native-svg`; miniaturas de lista ficam paradas; com "reduzir movimento" a animação começa pausada.
- Para revisar as poses: exporte os quadros e rode `node scripts/figures-gallery.mjs` (gera `dist/figures-gallery.html`).

### Ícone e abertura

O ícone (bonequinho levantando a barra) é desenhado por `scripts/generate-icons.mjs`, sem dependências: formas geométricas com borda suavizada, gravadas em PNG com o zlib do Node. Gera em `apps/mobile/assets/` o ícone clássico, a frente do ícone adaptativo do Android, a versão de uma cor (ícones temáticos do Android 13+ e ícone de notificação) e a imagem da abertura. Depois de mudar o desenho: `node scripts/generate-icons.mjs` e `npx expo prebuild --platform android --clean`.

## Exercícios e dados

### Fonte padrão: API gratuita da ExerciseDB

Sem cadastro nem chave: cerca de 1.500 exercícios com GIF em 180p (`oss.exercisedb.dev`). Ela limita a frequência das chamadas (responde 429 rápido), então o backend:

- baixa o catálogo inteiro uma vez, devagar (uma página de 25 a cada 2,5 s, com espera maior quando recebe 429). Leva alguns minutos na primeira vez;
- salva em `.cache/catalog.json` e só atualiza depois de 7 dias, servindo o catálogo antigo enquanto isso;
- responde `503` em `/catalog` enquanto o primeiro download não termina (o app mostra "catálogo sendo preparado" e permite tentar de novo). `GET /health` mostra o andamento.

Os GIFs vêm de URLs públicas da própria ExerciseDB (`static.exercisedb.dev`) e o app guarda cada um no celular depois do primeiro carregamento. O app mostra o crédito "Exercícios e animações: ExerciseDB (AscendAPI)" no detalhe do exercício.

> **Licença:** segundo o fornecedor, a versão gratuita é para uso não comercial. Para publicar um app que gera receita, contrate um plano pago (ou outra fonte com licença comercial) e confirme por escrito se é permitido guardar os GIFs no celular.

### Plano pago (RapidAPI)

Com `EXERCISE_SOURCE=rapidapi` e a chave, o backend busca por músculo-alvo na RapidAPI e serve os GIFs pela rota `/gifs/:id`, porque essas imagens exigem a chave no header. O app não muda: as duas fontes são convertidas para o mesmo formato.

Em ambas, o backend expõe `/catalog`, `/exercises/{bodyPart|target|equipment}/:valor` e `/exercises/exercise/:id` (filtrados a partir do catálogo em cache).

Alongamentos, posturas de yoga, mobilidade e golpes de boxe são descartados na conversão: não fazem parte do treino de força do plano. Cardio, antebraço e adutores também ficam de fora (o app não tem esses grupos). Do catálogo gratuito, cerca de 1.350 exercícios entram no app.

No app, toda resposta passa por Zod item a item (um registro ruim é descartado sem derrubar o catálogo) e vira o tipo interno `Exercise`. O catálogo validado vai para o SQLite e serve de fallback offline; os GIFs usam `expo-image` com `cachePolicy="disk"`. Nomes, instruções e erros comuns dos exercícios mais populares têm tradução local em `translations.ts`; o resto cai no texto original.

## APK local para instalar no celular (sem conta, sem servidor)

O APK leva o catálogo de exercícios dentro dele (`packages/feature-exercises/src/data/catalog-snapshot.json`), então funciona instalado sozinho no celular: sem backend, sem cabo. Os GIFs vêm da internet do celular, direto da ExerciseDB. Se o backend estiver acessível, o app usa o catálogo atualizado dele.

```bash
cd apps/mobile/android
gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a
```

O arquivo sai em `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`. Mande para o celular (WhatsApp, Drive, e-mail ou cabo), toque nele e permita "instalar apps desconhecidos" quando o Android pedir. Esse APK é assinado com a chave de teste: serve para testar, não para a Play Store.

Para atualizar o catálogo embutido: rode o backend (ele baixa para `apps/backend/.cache/catalog.json`) e depois `node scripts/update-catalog-snapshot.mjs`.

## APK com EAS Build

```bash
npm install -g eas-cli
eas login
cd apps/mobile
eas build:configure                                   # vincula o projeto à sua conta
eas build --profile preview --platform android        # gera um .apk instalável
```

Antes, troque `EXPO_PUBLIC_API_URL` no perfil `preview` do `eas.json` pela URL pública do backend (ou crie a variável no painel do EAS). O perfil `production` gera `.aab` para a Play Store.

## Visual e fluxo de treino

O estilo segue a linha dos apps de treino atuais (referência: appbefit.com), sem usar marca, logo ou imagens de terceiros:

- Escuro primeiro: fundo verde-petróleo quase preto, acento verde neon, cards bem arredondados e botão principal em pílula. O tema claro continua seguindo o sistema.
- **Treino em execução**: barra com duração, séries feitas e volume; tabela de séries (Série · Anterior · kg · reps · ✓) com edição direta, "+ Adicionar série" e "Marcar todas". Marcar uma série inicia o descanso.
- **Alertas de descanso** podem ser desligados no Perfil (salvo no MMKV). Com o app em segundo plano, uma notificação local (`expo-notifications`) avisa o fim do descanso; a permissão só é pedida ao começar o primeiro treino.
- **Treino em andamento é salvo a cada série** (MMKV). Se o app fechar, o Hoje mostra "Continuar treino"; se o plano mudou nesse meio-tempo, o rascunho é descartado.
- **Aquecimento automático** no composto principal: 50% × 10 e 70% × 5 (mais 85% × 2 acima de 60 kg), arredondado ao incremento do equipamento. Aparece na tabela como "A" e não conta como série nem volume.
- **Recordes pessoais**: ao finalizar, a tela "Treino concluído" mostra duração, séries, volume e os exercícios em que o 1RM estimado (fórmula de Epley) superou o histórico. O Progresso mostra o 1RM estimado do exercício selecionado.
- **Hoje** mostra os "Dias da semana" com os treinos já feitos e um card de destaque com a sessão e os músculos trabalhados.

## Decisões e limitações

- **FlashList 2** não usa mais `estimatedItemSize` (o tamanho é medido automaticamente na nova arquitetura), então o prop não aparece no código. As demais regras de lista estão aplicadas: `renderItem` estável, item extraído e memoizado, nomes prefixados.
- **Mecânica e dificuldade** não vêm da ExerciseDB em todos os planos; quando faltam, são inferidas pelo nome e pelos músculos secundários (`mapping.ts`).
- **Testes de UI** não foram escritos; a cobertura está no motor, no adaptador da API e nas estatísticas.
