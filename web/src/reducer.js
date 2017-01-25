import { combineReducers } from 'redux';
import values from 'object.values';

const camera = (state = { requestScreenshot: false, isPreviewing: false , manualScreenshot: false}, action) => {
  switch (action.type) {
    case 'showPreview':
      return {...state, active: true};

    case 'closePreview':
      return {...state, active: false};

    case 'automaticScreenshot':
      return {...state, active: true, requestAutomaticScreenshot: true};

    case 'manualScreenshot':
      return {...state, requestManualScreenshot: true};

    case 'closeCamera':
      return { active: false, requestManualScreenshot: false , requestAutomaticScreenshot: false};

    default:
      return state;
  }
};

const user = (state = {}, action) => {
  switch(action.type) {
    case 'fetchSignIn':
      // show loading
      return state;

    case 'onSignedIn':
      return action.payload || action.payload.user;

    case 'onSignedOut':
      return false;

    default:
      return state;
  }
}

const isSignedIn = (state = false, action) => {
  switch(action.type) {
    case 'onSignedIn':
      return true;

    case 'onSignedOut':
      return false;

    default:
      return state;
  }
}


const wall = (state = [], action) => {
  switch(action.type) {
    case 'onUpdate':
      return values(action.payload);

    default:
      return state;
  }
};

const reducer = combineReducers({
  camera,
  user,
  isSignedIn,
  wall
});

export default reducer;
