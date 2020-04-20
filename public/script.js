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

class Search {
  constructor(form, input, player) {
    this.player = player
    this.setup(form, input)
  }

  setup(form, input) {
    form.addEventListener('submit', e => {
      e.preventDefault()

      this.fetchData(input.value).then(data => {
        console.log(input.value)
        console.log(data)

        data.items.forEach(e => {
          const html = `<div class="card mb-3" style="max-width: 540px; max-height: 100px; cursor: pointer;">
            <div class="row no-gutters">
              <div class="col-md-4" style="max-height: 98px; max-width: 150px;">
                <img src="${e.snippet.thumbnails.default.url}" class="card-img" style="height: 100%;">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title" style="font-size: 18px;">${e.snippet.title}</h5>
                </div>
              </div>
            </div>
          </div>`
          const a = document.createElement('a')
          a.setAttribute('href', `#${e.id.videoId}`)
          a.innerHTML = html
          a.addEventListener('click', ev => {
            const b = $(ev.target).parentsUntil('#search-list', 'a')[0]
            this.player.setTrack(b.hash.substring(1, b.hash.length))
            const url = `http://${window.location.host}/download/${b.hash.substring(1, b.hash.length)}`
          })
          document.getElementById('search-list').appendChild(a)
        })
      })
    })
  }

  fetchData(query) {
    const url = `/search?q=${query}`
    return fetch(url).then(r => r.json())
  }
}

class Player {
  constructor() {
    this.playlist = []
    this.currentKey = 0
    this.currentAudioDuration = 0
    this.keysArray = []
    this.audio = new Audio()
    this.progressbar = document.getElementById('progress')
    this.setupUI()
  }

  setupUI() {
    $('#play-btn :checkbox').change(e => {
      if (e.target.checked) {
        this.audio.play()
      } else {
        this.audio.pause()
      }
    })

    this.audio.addEventListener('timeupdate', e => {
      if (this.currentAudioDuration > 0) {
        this.progressbar.value = 100 * (e.target.currentTime / this.currentAudioDuration)
      }
    })

    this.progressbar.addEventListener('mouseup', e => {
      console.log(e.target.value)
      const time = (e.target.value * this.currentAudioDuration) / 100
      console.log(time)
      this.audio.currentTime = time
    })
  }

  setPlaylist(playlist) {
    this.playlist = playlist
  }

  next() {

  }

  prev() {

  }

  setTrack(id) {
    fetch(`http://${window.location.host}/details/${id}`).then(r => r.json()).then(data => this.currentAudioDuration = data)
    this.audio.src = `http://${window.location.host}/download/${id}`
    this.audio.load()
    this.audio.play()
    $('#play-btn :checkbox').prop('checked', true)
  }
}

