const reg = new RegExp('^\\[?\\d+\\.\\d+\\,\\s?\\-?\\d+\\.\\d+\\]?$');

function insertNote(time, text, geo) {
  const listElement = `
  <li class="note-list-item">
    <div class="timeline-element"></div>
    <div class="note">
      <div class="note-time">${time}</div>
      <div class="note-body">
        <p class="note-text">${text}</p>
          <div class="note-info">
            <div class="geolocation">${geo}</div>
          </div>
      </div>
    </div>
  </li>
`;
  const list = document.querySelector('.notes-list');
  list.insertAdjacentHTML('afterbegin', listElement);
  if (text.length > 200) {
    const noteInfo = document.querySelector('.note-info');
    noteInfo.insertAdjacentHTML('beforeend', `
  <button class="reveal-btn">Show full text</button>`);

    // Разворот и сворачивание длинных заметок
    const notes = Array.from(document.querySelectorAll('.note-list-item'));
    notes.forEach((note) => {
      const revealBtn = note.querySelector('.reveal-btn');
      const noteText = note.querySelector('.note-text');
      if (revealBtn) {
        revealBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          if (note.classList.contains('full-item') && noteText.classList.contains('full-content')) {
            note.classList.remove('full-item');
            noteText.classList.remove('full-content');
            revealBtn.textContent = 'Show full text';
          } else {
            note.classList.add('full-item');
            noteText.classList.add('full-content');
            revealBtn.textContent = 'Hide full text';
          }
        });
      }
    });
  }
}

const notesShowArray = localStorage.getItem('Note') ? JSON.parse(localStorage.getItem('Note')) : [];
notesShowArray.forEach((note) => {
  insertNote(note.time, note.text, note.geolocation);
});

// Добавление новой заметки
function newNote(geoStatus) {
  // Дата и время
  const date = new Date();
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`;
  const day = `0${date.getDate()}`;
  const hours = `0${date.getHours()}`;
  const minutes = `0${date.getMinutes()}`;
  const seconds = `0${date.getSeconds()}`;
  const formattedTime = `${day.substr(-2)}.${month.substr(-2)}.${year} ${hours.substr(-2)}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
  const field = document.querySelector('.field');
  insertNote(formattedTime, field.value, geoStatus);
  const noteObj = {
    time: formattedTime,
    text: field.value,
    geolocation: geoStatus,
  };
  const notesArray = localStorage.getItem('Note') ? JSON.parse(localStorage.getItem('Note')) : [];
  notesArray.push(noteObj);
  localStorage.setItem('Note', JSON.stringify(notesArray));
  field.value = '';
}

function checkValidCoords(coordsField) {
  return reg.test(coordsField);
}

function showModal() {
  const modal = document.querySelector('.modal-block');
  modal.classList.add('reveal');
  const cancelBtn = modal.querySelector('.cancel-button');
  cancelBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    modal.classList.remove('reveal');
  });
  const coordsField = modal.querySelector('.coords-field');
  const enterCoordsBtn = modal.querySelector('.enter-coords-btn');
  enterCoordsBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (checkValidCoords(coordsField.value)) {
      newNote(coordsField.value);
      modal.classList.remove('reveal');
    } else {
      const invalidCoordsMsg = modal.querySelector('.invalid-coords-msg');
      invalidCoordsMsg.classList.remove('inactive');
    }
  });
}

const field = document.querySelector('.field');
field.addEventListener('keyup', (e) => {
  e.preventDefault();
  if (e.key === 'Enter') {
    // Геолокация
    if (navigator.geolocation) {
      const successCallback = (position) => {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        newNote(`${latitude}, ${longitude}`);
      };
      const errorCallback = () => {
        showModal();
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
      showModal();
    }
  }
});
