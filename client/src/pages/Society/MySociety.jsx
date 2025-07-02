import React, { useEffect, useState } from 'react';
import societyBg from '../../assets/societyBg.jpg';
import MySocietyImg from '../../assets/mySocietyImg.jpg';
import society_icon from '../../assets/society_icon.png';
import { useAppContext } from '../../context/AppContext.jsx';
import axios from 'axios';

const MySociety = () => {
  const { navigate, userRole, token, societyId } = useAppContext();
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSociety = async () => {
      try {
        const { data } = await axios.get(`/api/users/society/${societyId}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSociety(data.society);
      } catch (err) {
        console.error('Failed to fetch society:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && societyId) {
      fetchSociety();
    } else {
      setLoading(false);
    }
  }, [token, societyId]);

  if (loading) {
    return <div className="text-center mt-10 text-lg font-medium">Loading...</div>;
  }

  if (!society) {
    return <div className="text-center mt-10 text-red-500 font-medium">Society data not found.</div>;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{ backgroundImage: `url(${societyBg})`, zIndex: 0 }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black opacity-40" style={{ zIndex: 0 }} aria-hidden="true" />

      <div
        className="relative max-w-5xl w-full mx-auto mt-5 p-10 bg-white bg-opacity-90 rounded-2xl shadow-xl"
        style={{ zIndex: 1 }}
      >
        <h1 className="text-3xl font-bold text-center mb-2 flex justify-center gap-4">
          <img className="w-10 h-10 pb-1" src={society_icon} alt="img" /> My Society
        </h1>

        <div className="flex justify-center mb-6">
          <img
            src={MySocietyImg}
            alt={`${society.name} Image`}
            className="rounded-xl shadow-md max-h-48 object-cover"
          />
        </div>

        <div className="grid gap-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Society Name:</span>
            <span>{society.name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Society ID:</span>
            <span>{society._id}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Address:</span>
            <span>{society.created_by?.address || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Admin:</span>
            <span>{society.created_by?.name || "N/A"}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col items-center space-y-4">
          {userRole === 'admin' && (
            <button
              onClick={() => navigate('/my-society/admin/panel')}
              style={{
                backgroundColor: 'var(--color-primary)',
                cursor: 'pointer',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--color-primary-dull)')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--color-primary)')
              }
              className="text-white px-6 py-2 rounded-xl transition w-48"
            >
              Open Approval Panel
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'var(--color-primary)',
              cursor: 'pointer',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--color-primary-dull)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--color-primary)')
            }
            className="text-white px-6 py-2 rounded-xl transition w-48"
          >
            Leave Society
          </button>
        </div>
      </div>
    </div>
  );
};

export default MySociety;
