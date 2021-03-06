import { lastSeen, joinRoom } from '../../actions';

export const mapToProps = state => {
  return {
    user: state.user,
    isLoadingRoom: state.loading.isLoadingRoom,
    room: state.room,
    wall: state.wall,
    filterOptions: {
      showOffline: state.drawer.options.showOffline
    },
    nowProvider: () => {
      return Date.now();
    }
  };
};

export const mapToDispatch = dispatch => {
  return {
    updateLastSeen: () => {
      dispatch(lastSeen);
    },
    joinRoom: roomId => {
      dispatch(joinRoom(roomId));
    }
  };
};
