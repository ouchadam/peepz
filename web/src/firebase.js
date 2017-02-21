import * as fb from 'firebase';

const createWallPath = roomId => {
  return `wip/rooms/${roomId}/wall`;
};

const fetchSignIn = () => dispatch => {
  dispatch({type: 'fetchSignIn'});
  const unsubscribe = fb.auth().onAuthStateChanged(result => {
    unsubscribe();
    if (result) {
      dispatch({type: 'onSignedIn', payload: result});
    } else {
      dispatch({type: 'onSignedOut'});
    }
  });
};

const requestSignIn = () => dispatch => {
  const provider = new fb.auth.GoogleAuthProvider();
  fb.auth().signInWithPopup(provider).then(result => {
    const user = result.user;
    dispatchSignedIn(dispatch)(user)();
  });
};

const dispatchSignedIn = dispatch => user => () => {
  dispatch({type: 'onSignedIn', payload: user});
};

const submitScreenshot = roomId => user => screenshot => () => {
  const wallPath = createWallPath(roomId);
  return fb.storage()
    .ref()
    .child(`${wallPath}/${user.uid}/${user.uid}.webp`)
    .putString(screenshot, 'data_url')
    .then(result => {
      return fb.database().ref(`${wallPath}/${user.uid}/image`).set({
        payload: result.downloadURL,
        timestamp: Date.now()
      });
    });
};

const lastSeen = roomId => userId => () => {
  fb.database().ref(`${createWallPath(roomId)}/${userId}`).update({
    lastSeen: Date.now()
  });
};

const logout = () => dispatch => {
  return fb.auth().signOut().then(() => {
    dispatch({type: 'onSignedOut'});
  });
};

const roomListing = userId => dispatch => {
  fb.database().ref(`wip/users/${userId}/rooms`).on('value', snapshot => {
    const listings = snapshot.val();
    dispatch({type: 'onRoomListing', payload: listings});
  });
};

const joinRoom = roomId => user => dispatch => {
  const wallPath = createWallPath(roomId);
  dispatch({type: 'requestJoinRoom'});
  fb.database()
    .ref(wallPath)
    .once('value')
    .then(hasUser(user))
    .then(userExists => {
      return userExists ? {} : updateUser(wallPath, user);
    })
    .then(() => {
      return dispatch({type: 'onRoomJoined', payload: roomId});
    })
    .then(getWall(wallPath)(dispatch))
    .then(getRoomOptions(`wip/rooms/${roomId}/options`)(dispatch))
    .then(getUserOptions(`wip/users/${user.uid}/rooms/${roomId}/options`)(dispatch))
    .then(() => {
      return dispatch({type: 'onRoomLoaded'});
    }).catch(() => {
      return dispatch({type: 'onRoomError'});
    });
};

const hasUser = user => snapshot => {
  return snapshot.child(user.uid).exists();
};

const updateUser = (wallPath, user) => {
  return fb.database().ref(`${wallPath}/${user.uid}`).set({
    uid: user.uid,
    name: user.displayName
  });
};

let currentWallRef;
const getWall = wallPath => dispatch => () => {
  if (currentWallRef) {
    currentWallRef.off();
  }
  currentWallRef = fb.database().ref(wallPath);
  currentWallRef.on('value', snapshot => {
    const result = snapshot.val() || {};
    dispatch({type: 'onUpdate', payload: result });
  });
};

let currentOptionsRef;
const getRoomOptions = optionsPath => dispatch => () => {
  if (currentOptionsRef) {
    currentOptionsRef.off();
  }
  currentOptionsRef = fb.database().ref(optionsPath);
  currentOptionsRef.on('value', snapshot => {
    const result = snapshot.val() || {};
    dispatch({type: 'onRoomOptions', payload: result });
  });
};

const getUserOptions = optionsPath => dispatch => () => {
  return fb.database().ref(optionsPath).once('value', snapshot => {
    const result = snapshot.val();
    if (result) {
      dispatch({type: 'onUserRoomOptions', payload: result });
    }
  });
};

const updateUserRoomOptions = (userId, roomId, cameraMode) => dispatch => {
  dispatch({type: 'onCameraModeSelected', payload: cameraMode});
  return fb.database().ref(`wip/users/${userId}/rooms/${roomId}/options/cameraModeSelection`)
    .set(cameraMode.id);
};

export {
  fetchSignIn,
  requestSignIn,
  submitScreenshot,
  lastSeen,
  logout,
  roomListing,
  joinRoom,
  updateUserRoomOptions
};
