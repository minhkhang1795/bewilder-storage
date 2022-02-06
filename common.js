const get = document.getElementById.bind(document);
const query = document.querySelector.bind(document);

document.addEventListener('DOMContentLoaded', function () {
  // Set up Sign Up modal  
  let signUpButtons = document.querySelectorAll('.signup-button');
  let signUpModal = query('.signup-modal');
  let signUpModalDialog = query('.signup-modal-dialog');
  if (signUpModal) {
    function showsignUpModal() {
      signUpModal.style.display = 'block';
    }

    function hidesignUpModal() {
      signUpModal.style.display = 'none';
    }
    function modalDialogClick(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    signUpModal.addEventListener('click', hidesignUpModal);
    signUpModalDialog.addEventListener('click', modalDialogClick);
    if (signUpButtons) {
      for (let button of signUpButtons)
        button.addEventListener('click', showsignUpModal);
    }
  }
});

function buildForm(questions, formSelect) {
  if (!questions || !formSelect) {
    console.log('Cannot build form from quetions and formSelect');
    return;
  }

  console.log('Building form from questions and formSelect');
  formSelect.innerHTML = '';

  for (let question of questions) {
    var div = document.createElement('div');
    div.setAttribute('class', 'dynamic-form-item');

    var label = document.createElement('label');
    label.setAttribute('class', 'dynamic-form-item-label');
    label.setAttribute('for', question.id);
    label.innerHTML = question.title;
    if (question.isRequired) {
      label.innerHTML += '<span class="dynamic-form-asterisk"> *</span>'
    }

    if (question.type === 'MULTIPLE_CHOICE' && question.choices) {
      // question label
      div.appendChild(label);

      // radio button
      if (question.hasOtherOption) {
        question.choices.push('Other:');
      }
      for (let i = 0; i < question.choices.length; i++) {
        let choice = question.choices[i];
        var radio = document.createElement('input');
        radio.setAttribute('class', 'dynamic-form-item-radio');
        radio.setAttribute('type', 'radio');
        radio.setAttribute('name', question.id);
        radio.setAttribute('id', question.id + '.' + i);
        radio.setAttribute('value', choice);

        // handling isRequired
        if (question.isRequired)
          radio.setAttribute('required', '');

        // radio button label
        var span = document.createElement('span');
        span.setAttribute('for', question.id + '.' + i)
        span.innerText = choice;

        var label = document.createElement('label');
        label.setAttribute('class', 'dynamic-form-choice-label');
        label.appendChild(radio);
        label.appendChild(span);

        // handling 'other' option
        if (choice === 'Other:') {
          var input = document.createElement('input');
          input.setAttribute('class', 'dynamic-form-choice-input');
          input.setAttribute('type', 'text');
          input.setAttribute('name', question.id);
          input.setAttribute('id', question.id + '.' + i + '.' + 'otherInput');
          input.addEventListener('click', (e) => {
            get(question.id + '.' + i).checked = true;
          });
          label.appendChild(input);
        }

        div.appendChild(label);
      }
    } else if (question.type === 'CHECKBOX' && question.choices) {
      // question label
      div.appendChild(label);

      // checkbox
      if (question.hasOtherOption) {
        question.choices.push('Other:');
      }
      for (let i = 0; i < question.choices.length; i++) {
        let choice = question.choices[i];
        var checkbox = document.createElement('input');
        checkbox.setAttribute('class', 'dynamic-form-item-checkbox');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('name', question.id);
        checkbox.setAttribute('id', question.id + '.' + i);
        checkbox.setAttribute('value', choice);

        // handling isRequired
        if (question.isRequired) {
          if (i == 0)
            checkbox.setAttribute('required', '');
          checkbox.addEventListener('change', (e) => {
            var atLeastOneChecked = false;
            for (let j = 0; j < question.choices.length; j++) {
              atLeastOneChecked |= get(question.id + '.' + j).checked;
            }
            if (atLeastOneChecked) {
              get(question.id + '.' + 0).removeAttribute('required', '');
            } else {
              get(question.id + '.' + 0).setAttribute('required', '');
            }
          });
        }

        // checkbox label
        var span = document.createElement('span');
        span.setAttribute('for', question.id + '.' + i)
        span.innerText = choice;

        var label = document.createElement('label');
        label.setAttribute('class', 'dynamic-form-choice-label');
        label.appendChild(checkbox);
        label.appendChild(span);

        // handling 'other' option
        if (choice === 'Other:') {
          var input = document.createElement('input');
          input.setAttribute('class', 'dynamic-form-choice-input')
          input.setAttribute('type', 'text');
          input.setAttribute('name', question.id);
          input.setAttribute('id', question.id + '.' + i + '.' + 'otherInput');
          input.addEventListener('click', (e) => {
            get(question.id + '.' + i).checked = true;
          });
          label.appendChild(input);
        }

        div.appendChild(label);
      }
    } else if (question.type === 'PARAGRAPH_TEXT' || question.type === 'TEXT') {
      // question label
      div.appendChild(label);

      // text/area input
      var input = document.createElement(question.type === 'TEXT' ? 'input' : 'textarea');
      input.setAttribute('class', 'dynamic-form-text-input')
      input.setAttribute('type', 'text');
      input.setAttribute('id', question.id);
      input.setAttribute('name', question.id);

      // adjust text area height based on input
      if (question.type === 'PARAGRAPH_TEXT') {
        input.setAttribute('rows', 1);
        input.addEventListener("input", (e) => {
          e.target.currentHeight = Math.max(e.target.scrollHeight, e.target.currentHeight ?? 0);
          e.target.style.height = e.target.currentHeight + "px";
        });
      }
      if (question.isRequired)
        input.setAttribute('required', '');
      div.appendChild(input);
    }

    if (div.childElementCount) {
      formSelect.appendChild(div);
    }
  }
}

function signOut() {
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });
}