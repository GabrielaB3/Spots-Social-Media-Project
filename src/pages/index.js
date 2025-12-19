import "./index.css";
import {
  enableValidation,
  settings,
  disableButton,
  resetValidation,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

const editProfileBtn = document.querySelector(".profile__edit-button");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileform = document.forms["profile-form"];
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

const newPostBtn = document.querySelector(".profile__add-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const addCardFormEl = newPostModal.querySelector(".modal__form");
const addCardSubmitBtn = newPostModal.querySelector(".modal__submit-btn");
const cardLinkInput = newPostModal.querySelector("#card-image-input");
const cardCaptionInput = newPostModal.querySelector("#card-caption-input");

//Avatar form element
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSumitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const profileAvatarEl = document.querySelector(".profile__avatar");

//Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteSubmitBtn = deleteForm.querySelector(".modal__submit-btn");
const deleteCancelBtn = deleteModal.querySelector(".modal__cancel-btn");

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
console.log("Card template:", cardTemplate);
const cardList = document.querySelector(".cards__list");
console.log("Card list:", cardList);

let selectedCard, selectedCardId;

function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-button_active");

  api
    .changeLikeStatus(id, isLiked)
    .then((updatedCard) => {
      evt.target.classList.toggle("card__like-button_active");
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-button");
  const userHasLiked = data.isLiked;

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  if (userHasLiked) {
    cardLikeBtnEl.classList.add("card__like-button_active");
  }

  cardLikeBtnEl.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-button");
  cardDeleteBtnEl.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
  });

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;

    openModal(previewModal);
  });

  return cardElement;
}

const closeButtons = document.querySelectorAll(".modal__close-btn");

closeButtons.forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(popup));
});

editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editDescriptionInput.value = profileDescriptionEl.textContent;

  openModal(editProfileModal);

  resetValidation(
    editProfileform,
    [editProfileNameInput, editDescriptionInput],
    settings
  );
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

avatarModalBtn.addEventListener("click", function () {
  openModal(avatarModal);
});
avatarForm.addEventListener("submit", handleAvatarSubmit);

avatarModalCloseBtn.addEventListener("click", function () {
  closeModal(avatarModal);
});

deleteForm.addEventListener("submit", handleDeleteSubmit);

deleteCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  submitBtn.textContent = "Saving...";

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editDescriptionInput.value,
    })
    .then((updatedUser) => {
      profileNameEl.textContent = updatedUser.name;
      profileDescriptionEl.textContent = updatedUser.about;
      profileAvatarEl.src = updatedUser.avatar;

      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Save";
    });
}

editProfileform.addEventListener("submit", handleEditProfileSubmit);

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  addCardSubmitBtn.textContent = "Saving...";

  api
    .addCard({
      name: cardCaptionInput.value,
      link: cardLinkInput.value,
    })
    .then((newCard) => {
      const cardElement = getCardElement(newCard);
      cardList.prepend(cardElement);

      closeModal(newPostModal);
      evt.target.reset();
      disableButton(addCardSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      addCardSubmitBtn.textContent = "Save";
    });
}

addCardFormEl.addEventListener("submit", handleAddCardSubmit);

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      closeModal(modal);
    }
  });
});

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  avatarSumitBtn.textContent = "Saving...";

  api
    .editAvatarInfo(avatarInput.value)
    .then((updatedUser) => {
      profileAvatarEl.src = updatedUser.avatar;

      closeModal(avatarModal);
      avatarForm.reset();
    })
    .catch(console.error)
    .finally(() => {
      avatarSumitBtn.textContent = "Save";
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();

  deleteSubmitBtn.textContent = "Deleting...";

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      deleteSubmitBtn.textContent = "Deleted";
    });
}

function handleEscClose(event) {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(".modal.modal_opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;

  openModal(deleteModal);
}

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "06697d2b-bd9e-42a4-8343-a26458afeedb",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userData]) => {
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardList.append(cardElement);
    });

    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    profileAvatarEl.src = userData.avatar;
  })
  .catch(console.error);

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscClose);
}

enableValidation(settings);
