const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']


// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()  //  same as prepare statement in jdbc or PDO, using find function as default statement
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))  // same as author 
  }                   // first parameter is use to choice db column
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)  // lte == less then
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter) // gte == graet then 
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    res.redirect(`books`)
  } catch {
    renderNewPage(res, book, true)
  }
})

// show book
router.get('/:id', async (req, res) => {

  try {
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show', { book: book })
  } catch (error) {
    console.log(error)
    // res.redirect('/')
  }

})

// edit book (this method is for get the book data)
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  } catch (error) {
    res.redirect('/books')
  }


})


// update book (this method is for update book to new data)
router.put('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.body.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover != null || req.body.cover != '') {
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`books/show${book.id}`)
  } catch {
    if (book != null) {
      renderNewPage(res, book, true)
    } else {
      res.redirect('/')
    }

  }
})


router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  } catch{
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/')
    }
  }
})

function saveCover(book, coverEncodeed) {
  if (coverEncodeed == null) return
  const cover = JSON.parse(coverEncodeed)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }

}

async function renderNewPage(res, book, hasError = false) {

  renderFormPage(res, book, 'new', hasError)

}


async function renderEditPage(res, book, hasError = false) {

  renderFormPage(res, book, 'edit', hasError)

}


async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book'
      } else {
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}

module.exports = router