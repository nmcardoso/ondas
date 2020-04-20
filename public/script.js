class Autocomplete {
  constructor(input) {
    this.input = input
    this.currentFocus = -1
    this.suggestions = ['a', 'b']
    this.setup(input)
  }

  setup(input) {
    input.addEventListener('input', e => {
      const value = e.target.value
      this.currentFocus = -1
      let a, b, i

      if (!value) return false

      this.fetchData(value).then(data => {
        this.closeAllLists()
        this.suggestions = data[1]

        a = document.createElement('div')
        a.setAttribute('id', e.target.id + 'autocomplete-list')
        a.setAttribute('class', 'autocomplete-items')
        e.target.parentNode.appendChild(a)

        for (i = 0; i < this.suggestions.length; i++) {
          b = document.createElement('div')
          b.innerHTML = this.suggestions[i]
          b.addEventListener('click', e => {
            input.value = e.target.innerHTML
            this.closeAllLists()
          })
          a.appendChild(b)
        }
      })
    })

    input.addEventListener('keydown', e => {
      let x = document.getElementById(e.target.id + 'autocomplete-list')

      if (x) x = x.getElementsByTagName('div')

      if (e.keyCode == 40) {
        this.currentFocus++
        this.addActive(x)
      } else if (e.keyCode == 38) {
        this.currentFocus--
        this.addActive(x)
      } else if (e.keyCode == 13) {
        // e.preventDefault()
        if (this.currentFocus > -1) {
          if (x) x[this.currentFocus].click()
        }
      }
    })

    document.addEventListener('click', e => {
      this.closeAllLists(e.target)
    })
  }

  addActive(x) {
    if (!x) return false

    this.removeActive(x)

    if (this.currentFocus >= x.length) this.currentFocus = 0
    if (this.currentFocus < 0) this.currentFocus = x.length - 1

    x[this.currentFocus].classList.add('autocomplete-active')
  }

  removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove('autocomplete-active')
    }
  }

  closeAllLists(element) {
    const x = document.getElementsByClassName('autocomplete-items')
    for (let i = 0; i < x.length; i++) {
      if (element != x[i] && element != this.input) {
        x[i].parentNode.removeChild(x[i])
      }
    }
  }

  fetchData(query) {
    const url = `/autocomplete?q=${query}`
    return fetch(url).then(r => r.json())
  }
}

