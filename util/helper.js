const modal = document.querySelector('#modal');
const openModal = document.querySelector('.open-form');
const closeModal = document.querySelector('.close-button');

console.log(modal)
openModal.addEventListener('click', () => {

  modal.showModal()
})
closeModal.addEventListener('click', () => {
  modal.close()
})