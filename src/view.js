const finishProcess = (elements, i18n) => {
  const { button } = elements.staticElement;
  button.disabled = false;
  const { feedback } = elements;
  feedback.textContent = i18n.t('status.success');
  elements.feedback.classList.add('text-success');
};
const cleanFeedback = (elements) => {
  const { feedback, input } = elements;
  feedback.classList.remove('text-danger');
  input.classList.remove('is-invalid');
  feedback.textContent = '';
};

const renderStranger = (elements, i18n) => {
  Object.entries(elements.staticElement).forEach(([key, element]) => {
    const elem = element;
    elem.textContent = i18n.t(key);
  });
};
const sendHandler = (elements, i18n) => {
  elements.form.reset();
  elements.input.focus();
  const { button, label } = elements.staticElement;
  button.disabled = true;
  label.textContent = i18n.t('status.sending');
};
const processRequest = (elements, stateRequest, i18n) => {
  switch (stateRequest) {
    case 'filling':
      renderStranger(elements, i18n);
      break;
    case 'sending':
      cleanFeedback(elements);
      sendHandler(elements, i18n);
      break;
    case 'send':
      renderStranger(elements, i18n);
      finishProcess(elements, i18n);
      break;
    default:
      break;
  }
};

const createBlock = (title) => {
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h2');
  card.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = title;
  cardBody.append(cardTitle);
  card.append(cardBody);
  return card;
};
const createFeeds = (i18n, state) => {
  const feedContainer = document.querySelector('.feeds');
  feedContainer.innerHTML = '';
  const block = createBlock(i18n.t('feedTitle'));
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  state.feeds.forEach(({ title, description }) => {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');
    h3.classList.add('h6', 'm-0');
    p.classList.add('m-0', 'small', 'text-black-50');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    h3.textContent = title;
    p.textContent = description;
    li.append(h3, p);
    ul.append(li);
  });
  feedContainer.append(block, ul);
};
const createPost = (i18n, state) => {
  const postContainer = document.querySelector('.posts');
  postContainer.innerHTML = '';
  const block = createBlock(i18n.t('postsTitle'));

  const ulList = document.createElement('ul');
  ulList.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.forEach(({ titlePost, id, link }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const button = document.createElement('button');

    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    a.setAttribute('id', id);
    if (state.uiState.viewedId.has(id)) {
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }

    a.textContent = titlePost;

    button.setAttribute('type', 'button');
    button.setAttribute('data-id', id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18n.t('postsButton');
    li.append(a, button);
    ulList.append(li);
  });

  postContainer.append(block, ulList);
};

const createError = (elements, error, i18n) => {
  const { input, feedback } = elements;
  const { button } = elements.staticElement;
  feedback.classList.add('text-danger');
  input.classList.add('is-invalid');

  feedback.textContent = i18n.t(`errors.${error.key}`);
  button.disabled = false;
  if (error.key === 'notUrl') {
    feedback.previousElementSibling.classList.remove('text-muted');
  } else {
    feedback.previousElementSibling.classList.add('text-muted');
  }
};
const createModal = (elements, state, i18n) => {
  const activePost = state.posts.find(
    ({ id }) => id === state.uiState.currentId,
  );
  const { titlePost, descriptionPost, link } = activePost;
  const {
    modalTitle, modalBody, modalLink, modalBtn,
  } = elements;
  modalTitle.textContent = titlePost;
  modalBody.textContent = descriptionPost;
  modalLink.textContent = i18n.t('modal.modalLink');
  modalBtn.textContent = i18n.t('modal.modalBtn');
  modalLink.setAttribute('href', link);
};
const touchedPost = (state) => {
  state.uiState.viewedId.forEach((id) => {
    const elem = document.getElementById(id);
    if (!elem.classList.contains('fw-normal')) {
      elem.classList.remove('fw-bold');
      elem.classList.add('fw-normal', 'link-secondary');
    }
  });
};

export default (elements, state, i18n) => (path, value) => {
  switch (path) {
    case 'error':
      if (value === '') cleanFeedback(elements);
      createError(elements, value, i18n);
      break;
    case 'feeds':
      cleanFeedback(elements);
      createFeeds(i18n, state);
      break;
    case 'posts':
      createPost(i18n, state);
      break;
    case 'uiState.currentId':
      createModal(elements, state, i18n);
      break;
    case 'uiState.viewedId':
      touchedPost(state);
      break;
    case 'processRequest':
      processRequest(elements, value, i18n);
      break;
    default:
      break;
  }
};
