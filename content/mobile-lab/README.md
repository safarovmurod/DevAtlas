# Mobile lab — work in progress / в разработке / дар кор

These files are unpublished lesson drafts. The component checker runs your chosen file with your own computer permissions in a temporary directory inside your Expo project. It is not used by the DevAtlas server. Run only code you trust.

RU: Для проверки логики дней 2, 4 и 6 используйте отдельный blank TypeScript-проект Expo SDK 58 с установленными `jest`, `jest-expo`, `@react-native/jest-preset`, `@testing-library/react-native` и `test-renderer`. Передайте свой файл и путь к проекту:

TG: Барои санҷиши мантиқи рӯзҳои 2, 4 ва 6 blank TypeScript-проекти алоҳидаи Expo SDK 58 бо `jest`, `jest-expo`, `@react-native/jest-preset`, `@testing-library/react-native` ва `test-renderer` лозим аст. Файли худ ва роҳи проектро диҳед:

EN: To check days 2, 4 or 6 component logic, use a separate Expo SDK 58 blank TypeScript project with `jest`, `jest-expo`, `@react-native/jest-preset`, `@testing-library/react-native` and `test-renderer` installed. This environment verified versions 30.5.2, 58.0.12, 0.88.0, 14.1.0 and 1.3.1 respectively. Supply your own file and project path:

```sh
node verify-component.mjs 02 examples/day-02.tsx.txt /path/to/expo-project
node verify-component.mjs 04 solutions/day-04.tsx.txt /path/to/expo-project
node verify-component.mjs 06 solutions/day-06.tsx.txt /path/to/expo-project
```

RU: Проверка выполняет React-логику в Jest с mock-объектами React Native. Она не подтверждает работу экранного диктора, платформенную сборку, запуск на устройстве или Mastered. Оцените эти аспекты самостоятельно на доступном устройстве.

TG: Санҷиш мантиқи React-ро дар Jest бо mock-ҳои React Native иҷро мекунад. Он хонандаи экран, build-и платформа, кори дастгоҳ ё Mastered-ро тасдиқ намекунад. Ин ҷанбаҳоро дар дастгоҳи дастрас худ санҷед.

EN: The checker executes React logic under Jest’s mocked React Native host. It does not verify a screen reader, a platform build, device behavior or Mastered. Review those aspects on an available device.
