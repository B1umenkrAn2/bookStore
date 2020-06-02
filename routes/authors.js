const express = require('express')
const router = express.Router();
const Author = require('../models/author')
const Book = require('../models/book')


router.get('/', async (req, res) => {
    let searchOptions = {}

    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        })
    } catch{
        res.redirect('/')
    }

    // res.render('authors/index')  // should be the path of the view
})

// New Author Route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

//create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })

    try {
        const newAuthor = await author.save()  // when data save to db then create this object
        // res.redirect('authors/${newAuthor.id}')
        res.redirect(`authors`)
    } catch{
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
})


// show author
router.get('/:id', async (req, res) => {

    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }).limit(6).exec()
        res.render('authors/show',{
            author:author,
            booksByAuthor: books
        })
    } catch(err){
        res.redirect('/')
    }



})

// edit author
router.get('/:id/edit', async (req, res) => {

    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
    } catch{
        res.redirect('/authors')
    }

})

// update author
router.put('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch{
        if (authors == null) {
            res.send('/')
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'
            })
        }
    }
})


// delete author
router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect('/authors')
    } catch{
        if (author == null) {
            res.send('/')
        } else {
            res.redirect(`authors/${ author.id }`)
        }
    }
})


module.exports = router