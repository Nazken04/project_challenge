import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreationCardPage = () => {
  const [autoFillData, setAutoFillData] = useState({});
  const [caseNumber, setCaseNumber] = useState('');
  const [summonedPerson, setSummonedPerson] = useState('');
  const [formData, setFormData] = useState({
    case_number: '',
    ИИН_вызываемого: '',
    БИН_ИИН: '',
    планируемые_следственные_действия: '',
    дата_и_время_проведения: '',
    место_проведения: '',
    статус_по_делу: '',
    отношение_к_событию: '',
    виды_следствия: '',
    относится_ли_к_бизнесу: '',
    ИИН_защитника: '',
    обоснование: '',
    результат: '',
  });

  // Fetch autofill data when case number or ИИН changes
  useEffect(() => {
    const fetchAutoFillData = async () => {
      if (caseNumber || summonedPerson) {
        try {
          const response = await axios.get('http://localhost:3350/api/cards/autofill', {
            params: { case_number: caseNumber, ИИН_вызываемого: summonedPerson },
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          });
          setAutoFillData(response.data);
        } catch (error) {
          console.error('Error fetching autofill data:', error);
        }
      }
    };

    fetchAutoFillData();
  }, [caseNumber, summonedPerson]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:3350/api/cards', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Карточка успешно создана');
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Ошибка при создании карточки');
    }
  };

  return (
    <div>
      <h2>Создание карточки</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Номер УД:</label>
          <input
            type="text"
            name="case_number"
            value={formData.case_number || caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>ИИН вызываемого:</label>
          <input
            type="text"
            name="ИИН_вызываемого"
            value={formData.ИИН_вызываемого || summonedPerson}
            onChange={(e) => setSummonedPerson(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Статья УК:</label>
          <input
            type="text"
            name="статья"
            value={autoFillData.статья || ''}
            disabled
          />
        </div>
        <div>
          <label>Решение по делу:</label>
          <input
            type="text"
            name="решение"
            value={autoFillData.решение || ''}
            disabled
          />
        </div>
        <div>
          <label>ФИО вызываемого:</label>
          <input
            type="text"
            name="ФИО_вызываемого"
            value={autoFillData.ФИО_вызываемого || ''}
            disabled
          />
        </div>
        <div>
          <label>Должность вызываемого:</label>
          <input
            type="text"
            name="должность_вызываемого"
            value={autoFillData.должность_вызываемого || ''}
            disabled
          />
        </div>
        <div>
          <label>Место работы:</label>
          <input
            type="text"
            name="место_работы"
            value={autoFillData.место_работы || ''}
            disabled
          />
        </div>
        <div>
          <label>Регион:</label>
          <input
            type="text"
            name="регион"
            value={autoFillData.регион || ''}
            disabled
          />
        </div>
        <div>
          <label>Планируемые следственные действия:</label>
          <input
            type="text"
            name="планируемые_следственные_действия"
            value={formData.планируемые_следственные_действия}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Дата и время проведения:</label>
          <input
            type="datetime-local"
            name="дата_и_время_проведения"
            value={formData.дата_и_время_проведения}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Место проведения:</label>
          <input
            type="text"
            name="место_проведения"
            value={formData.место_проведения}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>ИИН защитника:</label>
          <input
            type="text"
            name="ИИН_защитника"
            value={formData.ИИН_защитника}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Обоснование:</label>
          <input
            type="text"
            name="обоснование"
            value={formData.обоснование}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Результат:</label>
          <input
            type="text"
            name="результат"
            value={formData.результат}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Создать карточку</button>
      </form>
    </div>
  );
};

export default CreationCardPage;
