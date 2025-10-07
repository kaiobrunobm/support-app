import React, { Fragment } from 'react';
import { Popover, Transition, PopoverPanel, PopoverButton } from '@headlessui/react';
import { BellIcon, EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router';
import { useNotification } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationPopover: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    const path = notification.type === 'new-ticket' ? '/app/tickets' : `/app/tickets/${notification.ticketId}`;
    navigate(path);
  };

  return (
    <Popover className="relative">
      <PopoverButton className="relative rounded-full p-2 text-text outline-none transition-colors hover:bg-border">
        <BellIcon size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </PopoverButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-border ring-opacity focus:outline-none">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold px-4">Notificações</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96  overflow-y-scroll scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer border-t border-border p-4 transition-colors hover:bg-border/50 ${
                    !notification.read ? 'bg-border/20' : ''
                  }`}
                >
                  <p className="font-bold">{notification.title}</p>
                  <p className="text-sm text-secondaryText">{notification.body}</p>
                  <p className="mt-1 text-xs text-secondaryText/70">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-secondaryText">
                <EnvelopeSimpleIcon size={40} />
                <p className="mt-2">Você não tem notificações.</p>
              </div>
            )}
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
};

export default NotificationPopover;

