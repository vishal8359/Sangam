import React from 'react';
import {
  Home as HomeIcon,
  Forum as ForumIcon,
  Poll as PollIcon,
  LocalOffer as LocalOfferIcon,
  ReportProblem as ReportProblemIcon,
  Event as EventIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';

const Sidebar = () => {
  const menu = {
    segment: 'home',
    title: 'My society',
    icon: <HomeIcon />,
    path: '/my-society',
    children: [
      { segment: 'chats', title: 'Chats', icon: <ForumIcon />, path: '/my-society/chats' },
      { segment: 'polls', title: 'Polls', icon: <PollIcon />, path: '/my-society/polls' },
      { segment: 'ads', title: 'New products', icon: <LocalOfferIcon />, path: '/my-society/ads' },
      { segment: 'complains', title: 'Complains', icon: <ReportProblemIcon />, path: '/my-society/complains' },
      { segment: 'events', title: 'Events', icon: <EventIcon />, path: '/my-society/events' },
      { segment: 'notices', title: 'Notices', icon: <CampaignIcon />, path: '/my-society/notices' },
    ],
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl shadow-md max-w-xs">
      <div className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
        {menu.icon}
        {menu.title}
      </div>

      <div className="space-y-2">
        {menu.children.map((item) => (
          <div
            key={item.segment}
            className="bg-white text-black p-3 rounded-lg hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
            onClick={() => window.location.href = item.path} // optional navigation
          >
            {item.icon}
            <span>{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
