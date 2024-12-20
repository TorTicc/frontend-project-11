import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import * as _ from 'lodash';
import axios from 'axios';
import resources from './locales/index.js';
import parser from './parser.js';
import render from './view.js';

const addProxy = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return proxyUrl.toString();
};
const timer = 5000;
export default () => {
  yup.setLocale({
    string: {
      url: () => ({ key: 'notUrl' }),
      required: () => ({ key: 'empty' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'alreadyInList' }),
    },
  });

  const elements = {
    staticElement: {
      title: document.querySelector('h1'),
      subtitle: document.querySelector('.lead'),
      label: document.querySelector('[for="url-input"]'),
      button: document.querySelector('[type="submit"]'),
    },
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    postsList: document.querySelector('.posts'),
    feedsList: document.querySelector('.feeds'),

    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('[target="_blank"]'),
    modalBtn: document.querySelector('.btn-secondary'),
  };

  const initialState = {
    processRequest: null,
    error: null,
    posts: [],
    feeds: [],
    uiState: {
      currentId: '',
      viewedId: new Set(),
    },
  };
  const i18n = i18next.createInstance();
  i18n
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => {
      const validationEpta = (url, urls) => yup.string().required().url().notOneOf(urls)
        .validate(url);

      const watching = onChange(
        initialState,
        render(elements, initialState, i18n),
      );
      watching.processRequest = 'filling';
      const updatePosts = (feeds) => {
        const promises = feeds.map(({ url }) => axios.get(addProxy(url)).then((response) => {
          const { posts } = parser(response.data.contents);
          const oldPosts = watching.posts.map(({ url: link }) => link);
          const newPosts = posts.filter((post) => !oldPosts.includes(post.url));
          const updatesPosts = newPosts.map((upPost) => ({
            ...upPost,
            id: _.uniqueId(),
          }));

          watching.posts = [...updatesPosts, ...watching.posts];
        }));
        Promise.all(promises).finally(() => {
          setTimeout(() => updatePosts(watching.feeds), timer);
        });
      };
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const targetUrl = data.get('url').trim();
        const urlsList = watching.feeds.map(({ url }) => url);
        validationEpta(targetUrl, urlsList)
          .then(() => {
            watching.error = '';
            watching.processRequest = 'sending';
            return axios.get(addProxy(targetUrl));
          })
          .then((response) => {
            const { feed, posts } = parser(response.data.contents);
            watching.feeds.push({ ...feed, id: _.uniqueId(), url: targetUrl });
            posts.forEach((post) => watching.posts.push({ ...post, id: _.uniqueId() }));
            watching.processRequest = 'send';

            updatePosts(watching.feeds);
          })
          .catch((err) => {
            watching.processRequest = 'filling';
            if (err.name === 'AxiosError') {
              watching.error = { key: 'networkError' };
            } else if (err.message === 'notRss') {
              watching.error = { key: 'notRss' };
            } else {
              watching.error = err.message;
            }
          });
      });
      elements.postsList.addEventListener('click', (e) => {
        const targetId = e.target.dataset.id;
        if (e.target.tagName === 'A') {
          watching.uiState.viewedId.add(e.target.id);
        }
        if (e.target.tagName === 'BUTTON') {
          watching.uiState.viewedId.add(e.target.dataset.id);
          watching.uiState.currentId = targetId;
        }
      });
    });
};
