import * as yup from 'yup';
import onChange from 'on-change';
import { clean, render } from './view.js';

const validationEpta = (url, urls) => yup
  .string()
  .required()
  .url('Ссылка должна быть валидным URL')
  .notOneOf(urls, 'RSS уже существует')
  .validate(url);

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    postsList: document.querySelector('.posts'),
    feedsList: document.querySelector('.feeds'),
    modal: document.querySelector('.modal'),
    modalHeader: document.querySelector('.modal-header'),
    modalBody: document.querySelector('.modal-body'),
    modalHref: document.querySelector('.full-article'),
  };
  const initialState = {
    processRequest: 'filling',
    error: null,
    posts: [],
    feeds: [],
    uiState: {
      currentId: '',
      viewedId: '',
    },
  };
  const watching = onChange(initialState, render(elements, initialState));
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url').trim();
    const urlsList = watching.feeds.map((feed) => feed.url);
    validationEpta(url, urlsList)
      .then((data) => {
        watching.feeds.push({ url });
        clean(elements);
        elements.feedback.textContent = 'Всё заебись';
        elements.feedback.classList.add('text-success');
      })
      .catch((err) => {
        watching.error = err;
      });
  });
};
