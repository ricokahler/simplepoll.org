import shortId from 'shortid';

function getUserId() {
  const userId = localStorage.getItem('user_id');
  if (userId) {
    return userId;
  }

  const newUserId = shortId();
  localStorage.setItem('user_id', newUserId);
  return newUserId;
}

export default getUserId;
