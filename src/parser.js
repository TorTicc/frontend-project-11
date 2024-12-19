export default (stream) => {
  const parser = new DOMParser();
  const response = parser.parseFromString(stream, 'text/xml');
  const parsError = response.querySelector('parsererror');
  if (parsError) {
    throw new Error('notRss');
  }

  const title = response.querySelector('channel > title').textContent;
  const description = response.querySelector('description').textContent;
  const feed = { title, description };

  const items = response.querySelectorAll('item');

  const posts = Array.from(items).map((post) => {
    const titlePost = post.querySelector('title').textContent;
    const descriptionPost = post.querySelector('description').textContent;
    const link = post.querySelector('link').textContent;
    return { titlePost, descriptionPost, link };
  });
  return { feed, posts };
};
// http://lorem-rss.herokuapp.com/feed
