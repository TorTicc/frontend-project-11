const clean = (elements) => {
  const { feedback, input } = elements;
  feedback.classList.remove('text-danger');
  input.classList.remove('is-invalid');
};

const createError = (elements, error) => {
  const { input } = elements;
  const { feedback } = elements;
  feedback.classList.add('text-danger');
  input.classList.add('is-invalid');
  feedback.innerText = error.message;
};

const render = (elements, state) => (path, value) => {
  switch (path) {
    case 'error':
      createError(elements, value);
      break;
  }
};
export { clean, render };
