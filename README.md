# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.


## Запуск фронтенда

Для того чтобы запустить только фронтенд, можно использовать Docker с файлом конфигурации, предназначенным для фронта.

1. **Запуск фронтенда в контейнере:**

   Для запуска фронтенд-приложения создайте контейнер:

   ```bash
   docker build -t my-frontend .
   ```
   
   и запустите контейнер:

   ```bash
   docker run -p 3000:3000 my-frontend
   ```

   Это создаст Docker-образ для фронтенда, установит все зависимости и запустит приложение внутри контейнера.

   - Фронтенд будет доступен по адресу: `http://localhost:3000`

2. **Что происходит**:
   - Docker запускает контейнер с фронтендом.
   - Контейнер устанавливает все зависимости с помощью `npm install`, собирает проект через `npm run build`, а затем запускает сервер с помощью `npm start`.
   - Приложение будет слушать на порту 3000 внутри контейнера и доступно по тому же порту на локальной машине.

## Интеграция фронтенда с бэкендом

Для того чтобы упростить структуру проекта и иметь всё в одном месте, можно интегрировать фронтенд в бэкенд. Это позволит запускать оба компонента (фронтенд и бэкенд) с помощью одной команды, а также избежать необходимости запускать два отдельных контейнера.

1. **Шаги для интеграции**:
   - Поместите исходный код фронтенда в папку с бэкендом, чтобы структура проекта стала единой.
   - Используйте Docker Compose, чтобы собрать и запустить оба компонента с одной командой.

2. **Запуск бэкенда с интегрированным фронтендом**:

    1. Для того чтобы запустить бэкенд вместе с фронтендом, склонируйте бэкенд из репозитория [https://github.com/sdiki1/QRcodesSystem](https://github.com/sdiki1/QRcodesSystem):
        ```bash
        git clone https://github.com/sdiki1/QRcodesSystem
        ```
    2. Вставьте Ваш фронтенд в качестве одной из папок в проекте. Схема должна быть такой:
        ```
        QRSystem/
        ├── frontend/ # - в этой папке должен находиться Весь Ваш фронтенд
        │   ├── Dockerfile
        │   ├── public/
        │   ├── src/
        │   ├── package.json
        │   └── ... # остальные файлы фронтенда
        ├── admin_panel/
        ├── auth_app/
        ├── main_admin/
        ├── main_worker/
        └── manage.py         

    3. Запустите в директории QRSystem:
   ```bash
   docker-compose -f docker-compose.frontend.yml up --build
   ```

   Эта команда сделает следующее:
   - Сначала создаст образ для фронтенда.
   - Запустит оба компонента (бэкенд и фронтенд) с помощью Nginx или другого прокси-сервера.
   - Nginx будет перенаправлять запросы на API бэкенда через `/api/`, а остальные запросы перенаправит на фронтенд-приложение.

3. **Что происходит**:
   - Docker запускает контейнеры для фронтенда и бэкенда, соединяет их и позволяет работать с интегрированным приложением.
   - Все запросы по пути `http://localhost:8080/api/` будут перенаправляться на бэкенд, а остальные на фронтенд.
   - Система будет доступна по адресу: `http://localhost:8080`


## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

