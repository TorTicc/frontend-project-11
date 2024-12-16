export default stream => {
	const parser = new DOMParser()
	const response = parser.parseFromString(stream, 'text/xml')
	const parsError = response.querySelector('parsererror')
	if (parsError) {
		throw new Error({ message: { key: 'notRss' } })
	}

	const title = response.querySelector('channel > title').textContent
	const description = response.querySelector('description').textContent
	const feed = { title, description }

	const items = response.querySelectorAll('item')

	const posts = Array.from(items).map(post => {
		const title = post.querySelector('title').textContent
		const description = post.querySelector('description').textContent
		const link = post.querySelector('link').textContent
		return { title, description, link }
	})
	return { feed, posts }
}
// http://lorem-rss.herokuapp.com/feed
