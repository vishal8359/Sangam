import React, { useEffect, useState } from "react";

const mockMembers = [
  {
    _id: "1",
    name: "Vishal Gupta",
    address: "Flat 101, A-Wing",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    _id: "2",
    name: "Anjali Sharma",
    address: "Flat 102, A-Wing",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    _id: "3",
    name: "Rahul Mehra",
    address: "Flat 203, B-Wing",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
];

const InviteMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState({});

  useEffect(() => {
    setMembers(mockMembers);
    const initial = {};
    mockMembers.forEach((m) => (initial[m._id] = false));
    setInvites(initial);
  }, []);

  const handleToggle = (id) => {
    setInvites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInviteAll = () => {
    const areAllInvited = members.every((m) => invites[m._id]);

    const updatedInvites = {};
    members.forEach((m) => {
      updatedInvites[m._id] = !areAllInvited;
    });

    setInvites(updatedInvites);
  };

  return (
    <div className="flex-1 py-10 flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Invite Members</h2>
          <button
            onClick={handleInviteAll}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            {members.every((m) => invites[m._id]) ? "Remove All" : "Invite All"}
          </button>
        </div>

        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Member</th>
                <th className="px-4 py-3 font-semibold truncate">Address</th>
                <th className="px-4 py-3 font-semibold truncate">Invite</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {members.map((member, index) => (
                <tr key={member._id} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded-full overflow-hidden w-12 h-12">
                      <img
                        src={member.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="truncate max-sm:hidden w-full">
                      {member.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{member.address}</td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={invites[member._id]}
                        onChange={() => handleToggle(member._id)}
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InviteMembersPage;
