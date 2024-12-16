import * as yup from 'yup'
import onChange from 'on-change'
import i18next from 'i18next'
import resources from './locales/index.js'
import parser from './parser.js'
import * as _ from 'lodash'
import axios from 'axios'
import render from './view.js'

const addProxy = url => {
	const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app')
	proxyUrl.searchParams.append('disableCache', 'true')
	proxyUrl.searchParams.append('url', url)
	return proxyUrl.toString()
}

export default () => {
	yup.setLocale({
		string: {
			url: () => ({ key: 'notUrl' }),
			required: () => ({ key: 'empty' }),
		},
		mixed: {
			notOneOf: () => ({ key: 'alreadyInList' }),
		},
	})

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
		modal: document.querySelector('.modal'),
		modalHeader: document.querySelector('.modal-header'),
		modalBody: document.querySelector('.modal-body'),
		modalHref: document.querySelector('.full-article'),
	}

	const initialState = {
		processRequest: null,
		error: null,
		posts: [],
		feeds: [],
		uiState: {
			currentId: '',
			viewedId: '',
		},
	}
	const i18n = i18next.createInstance()
	i18n
		.init({
			lng: 'ru',
			debug: false,
			resources,
		})
		.then(() => {
			const validationEpta = (url, urls) =>
				yup.string().required().url().notOneOf(urls).validate(url)

			const watching = onChange(
				initialState,
				render(elements, initialState, i18n)
			)
			watching.processRequest = 'filling'
			elements.form.addEventListener('submit', e => {
				e.preventDefault()
				const data = new FormData(e.target)
				const targetUrl = data.get('url').trim()
				const urlsList = watching.feeds.map(({ url }) => url)
				validationEpta(targetUrl, urlsList)
					.then(() => {
						watching.error = ''
						watching.processRequest = 'sending'
						return axios.get(addProxy(targetUrl))
					})
					.then(response => {
						const { feed, posts } = parser(response.data.contents)
						watching.feeds.push({ ...feed, id: _.uniqueId(), url: targetUrl })
						posts.forEach(post =>
							watching.posts.push({ ...post, id: _.uniqueId() })
						)
						watching.processRequest = 'send'
					})
					.catch(err => {
						watching.error = err.message
					})
			})
		})
		.catch(error => {
			console.log(error)
		})
}
