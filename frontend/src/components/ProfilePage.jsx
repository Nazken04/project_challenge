import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../styles/ProfilePage.css"; // To style the profile page

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        "http://localhost:3350/api/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data);
    };

    fetchUserData();
  }, []);

  // Formik setup for profile form
  const formik = useFormik({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Имя обязательно"),
      email: Yup.string()
        .email("Неверный формат email")
        .required("Email обязателен"),
    }),
    onSubmit: async (values) => {
      try {
        const token = localStorage.getItem("authToken");
        await axios.put("http://localhost:3350/api/user/profile", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Профиль обновлён");
      } catch (error) {
        alert("Ошибка обновления профиля");
      }
    },
  });

  // Handle password change
  const handlePasswordChange = async () => {
    const newPassword = prompt("Введите новый пароль:");
    if (newPassword) {
      try {
        const token = localStorage.getItem("authToken");
        await axios.put(
          "http://localhost:3350/api/user/change-password",
          { password: newPassword },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Пароль обновлён");
      } catch (error) {
        alert("Ошибка обновления пароля");
      }
    }
  };

  // Handle account deletion
  const handleAccountDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить свой аккаунт?")) {
      try {
        const token = localStorage.getItem("authToken");
        await axios.delete("http://localhost:3350/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Аккаунт удалён");
        // Redirect to login page
        window.location.href = "/login";
      } catch (error) {
        alert("Ошибка удаления аккаунта");
      }
    }
  };

  if (!user) return <div>Загрузка...</div>;

  return (
    <div className="profile-container">
      <h1>Профиль пользователя</h1>
      <div className="profile-card">
        <img
          src="https://via.placeholder.com/150"
          alt="Profile"
          className="profile-image"
        />
        <form onSubmit={formik.handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            <input
              type="text"
              id="name"
              name="name"
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            {formik.errors.name && formik.touched.name ? (
              <div className="error">{formik.errors.name}</div>
            ) : null}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={formik.handleChange}
              value={formik.values.email}
            />
            {formik.errors.email && formik.touched.email ? (
              <div className="error">{formik.errors.email}</div>
            ) : null}
          </div>
          <button type="submit" className="btn">
            Обновить профиль
          </button>
        </form>
        <div className="actions">
          <button onClick={handlePasswordChange} className="btn">
            Изменить пароль
          </button>
          <button onClick={handleAccountDelete} className="btn delete-btn">
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
