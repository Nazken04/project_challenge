import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProfilePage.css'; // Import your CSS file

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error("Token not found, please log in.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get('http://localhost:3350/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setEditedUser(response.data) // Initialize editedUser
      } catch (error) {
        console.error('Error fetching user profile:', error);
        alert('Ошибка получения профиля');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEditClick = () => {
    setIsEditing(true);
  
  };

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async () => {
    try {
      await axios.put('http://localhost:3350/api/user/profile', editedUser, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setUser(editedUser);
      setIsEditing(false);
      alert("Профиль успешно обновлен");
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Ошибка обновления профиля');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Вы уверены, что хотите удалить свой аккаунт?")) {
      try {
        await axios.delete('http://localhost:3350/api/user/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        localStorage.removeItem('authToken');
        navigate('/login');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Ошибка удаления аккаунта');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (!user) return <div>Загрузка...</div>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="profile-container">
      <h1>Профиль пользователя</h1>
      <div className="profile-card">
        <img src="https://via.placeholder.com/150" alt="Profile" className="profile-image" />
        <div className="profile-form">
          {/* Name and Email inputs */}
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            {isEditing ? (
              <input type="text" id="name" name="name" value={editedUser.name} onChange={handleChange} />
            ) : (
              <span>{user.name}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            {isEditing ? (
              <input type="email" id="email" name="email" value={editedUser.email} onChange={handleChange} />
            ) : (
              <span>{user.email}</span>
            )}
          </div>

          {/* Role dropdown */}
          <div className="form-group">
            <label htmlFor="role">Роль</label>
            {isEditing ? (
              <select id="role" name="role" value={editedUser.role} onChange={handleChange}>
                <option value="Сотрудник СУ">Сотрудник СУ</option>
                <option value="Аналитик СД">Аналитик СД</option>
                <option value="Модератор">Модератор</option>
              </select>
            ) : (
              <span>{user.role}</span>
            )}
          </div>

          {/* Registration Date */}
          <div className="form-group">
            <label>Дата регистрации:</label>
            <span>{formatDate(user.date_registered)}</span>
          </div>

          {/* Edit/Save button */}
          {isEditing ? (
            <button onClick={handleSaveClick}>Сохранить</button>
          ) : (
            <button onClick={handleEditClick}>Редактировать профиль</button>
          )}
        </div>

        {/* Logout and Delete buttons */}
        <button onClick={handleLogout}>Выход</button>
        <button onClick={handleDeleteAccount}>Удалить аккаунт</button>
      </div>
    </div>
  );
};

export default ProfilePage;