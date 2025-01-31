import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { thunkFetchServers, thunkFetchServer, thunkJoinServer, thunkLeaveServer } from "../../redux/servers";
import { Navigate, Link, useParams } from "react-router-dom";
import { thunkFetchChannels } from "../../redux/channels";
import { thunkLogout } from "../../redux/session";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import ServerFormModal from "../Servers/ServerFormModal";
import ChannelFormModal from "../Channels/ChannelFormModal";
import Chat from "../Messaging/Chat"; // <-- import Chat component
import "../DiscoverPage/DiscoverPage.css";
import "./ServerDetails.css";
import { FaCompass, FaChevronDown, FaTimes, FaPlus, FaHashtag, FaCog } from "react-icons/fa";
import { fetchMessages } from "../../redux/messages";

function ServerDetailPage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const user = useSelector((state) => state.session.user);

  const allServers = useSelector((state) => state.servers.allServers) || [];
  const joinedServers = useSelector((state) => state.servers.joinedServers) || [];
  const viewedServers = useSelector((state) => state.servers.viewedServers) || [];
  const server = allServers.find((s) => s.id === parseInt(id));
  const channels = useSelector((state) => state.channels.channels) || [];
  const [currentChannel, setCurrentChannel] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch servers and server details when user/id changes
  useEffect(() => {
    if (user) {
      dispatch(thunkFetchServers());
      dispatch(thunkFetchServer(id));
      dispatch(thunkFetchChannels(id));
    }
  }, [dispatch, user, id]);

  // Set default channel to #general if it exists
  useEffect(() => {
    if (channels.length > 0) {
      const generalChannel = channels.find(channel => channel.name.toLowerCase() === 'general');
      if (generalChannel) {
        setCurrentChannel(generalChannel);
        dispatch(fetchMessages(generalChannel.id));
      } else {
        setCurrentChannel(channels[0]);
        dispatch(fetchMessages(channels[0].id));
      }
    }
  }, [channels, dispatch]);

  // Event listener for closing dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.server-name-container') && 
          !event.target.closest('.server-dropdown-menu') &&
          !event.target.closest('.message-actions-button') &&
          !event.target.closest('.message-dropdown-menu')) {
        setDropdownOpen(false);
        // setDropdownMessageId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(thunkLogout());
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleIconClick = (e) => {
    e.stopPropagation();
    toggleDropdown();
  };

  const handleJoinServer = () => {
    dispatch(thunkJoinServer(id));
  };

  const handleLeaveServer = () => {
    dispatch(thunkLeaveServer(id));
  };

  const handleChannelClick = (channel) => {
    setCurrentChannel(channel);
    dispatch(fetchMessages(channel.id)); // Fetch messages when switching channels
  };

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!server) {
    return <div>Loading...</div>;
  }

  const isMember = joinedServers.includes(server.id);

  return (
    <div className="server-details-page-container">
      {/* --------------- sidebar ----------------- */}
      <div className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            {/* --------------- viewed Servers ----------------- */}
            {viewedServers.map((server) => (
              <li key={server.id} className="server-icon">
                <Link to={`/servers/${server.id}`}>
                  <div className="icon-circle">
                    {server.avatar_url ? (
                      <img src={server.avatar_url} alt={`${server.name} avatar`} className="server-avatar" />
                    ) : (
                      server.name[0].toUpperCase()
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <ul>
            {/* --------------- joined Servers ----------------- */}
            {joinedServers.map((serverId) => {
              const server = allServers.find((s) => s.id === serverId);
              return (
                <li key={server.id} className="server-icon">
                  <Link to={`/servers/${server.id}`}>
                    <div className="icon-circle">
                      {server.avatar_url ? (
                        <img src={server.avatar_url} alt={`${server.name} avatar`} className="server-avatar" />
                      ) : (
                        server.name[0].toUpperCase()
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
            <li className="divider"></li> {/* add the divider here */}
            <li>
              <OpenModalButton
                modalComponent={<ServerFormModal />}
                buttonText="+"
                className="create-server-icon"
              />
            </li>
            <li>
              <Link to="/discover-page" className="discover-page-icon">
                <div className="discover-icon">
                  <FaCompass />
                </div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="banner-channel-main-container">
        {!isMember && (
          <div className="join-server-banner-container">
            <div className="join-server-call-to-action">
              <div className="join-server-words">
                <p>You are currently in preview mode. Join this server to start chatting!</p>
              </div>
              <button className="join-server-button" onClick={handleJoinServer}>Join this server</button>
            </div>
          </div>
        )}
        <div className="channel-and-main">
          <div className={`channel-nav ${!isMember ? 'with-banner' : ''}`}>
          {/* --------------- side nav ----------------- */}
            {server.banner_url ? (
              <div className="server-banner" onClick={toggleDropdown}>
                <img src={server.banner_url} alt={`${server.name} banner`} />
                <div className="server-name-container" onClick={toggleDropdown}>
                  <h1 className="server-name-side-nav">{server.name}</h1>
                  {dropdownOpen ? (
                    <FaTimes className="dropdown-icon" onClick={handleIconClick} />
                  ) : (
                    <FaChevronDown className="dropdown-icon" onClick={handleIconClick} />
                  )}
                </div>
              </div>
            ) : (
              <div className="server-name-container no-banner" onClick={toggleDropdown}>
                <h1 className="server-name-side-nav">{server.name}</h1>
                {dropdownOpen ? (
                  <FaTimes className="dropdown-icon" onClick={handleIconClick} />
                ) : (
                  <FaChevronDown className="dropdown-icon" onClick={handleIconClick} />
                )}
              </div>
            )}
            {dropdownOpen && (
              <ul className="server-dropdown-menu">
                {/* --------------- edit server link ----------------- */}
                <li>
                  <Link to={`/servers/${id}/edit`} className="server-dd-hover">Edit Server</Link>
                </li>
                {/* --------------- create server modal ----------------- */}
                <li className="server-dd-hover create-channel-item">
                  <OpenModalButton
                    modalComponent={<ChannelFormModal serverId={id} />}
                    buttonText="Create Channel"
                    className="create-channel-link"
                  />
                </li>
                {/* --------------- leave server modal ----------------- */}
                {isMember && (
                  <li className="server-dd-hover leave-server-item" onClick={handleLeaveServer}>
                    Leave Server
                  </li>
                )}
              </ul>
            )}
            <div className="channel-list-container">
              <div className="channel-header">
                <h5>Channels</h5>
                <div className="create-channel-tooltip-wrapper">
                  <OpenModalButton
                    modalComponent={<ChannelFormModal serverId={id} />}
                    buttonText={<FaPlus />}
                    className="create-channel-icon"
                  />
                  <div className="tooltip">Create Channel</div>
                </div>
              </div>
              <div className="channel-list">
                <ul>
                  {channels && channels.length > 0 ? (
                    channels.map((channel) => (
                      <li key={channel.id} onClick={() => handleChannelClick(channel)}>
                        <div className={channel.id === currentChannel?.id ? 'channel-list-item active' : 'channel-list-item'}>
                          <FaHashtag className="channel-icon" />
                          <div className="channel-name">
                            {channel.name.toLowerCase()}
                          </div>
                          <Link to={`/channels/${channel.id}/edit`} className="settings-icon">
                            <FaCog />
                            <div className="tooltip">Edit Channel</div>
                          </Link>
                        </div>
                      </li>
                    ))
                  ) : (
                    <div className="no-channels">
                      <p>You have no active channels <br></br> Create a channel to start messaging</p>
                    </div>
                  )}
                </ul>
              </div>
            </div>
            <div className="profile-nav">
              <div className="profile-info">
                <span>{user.username}</span>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Log Out
              </button>
            </div>
          </div>
          {/* --------------- main content ----------------- */}
          <div className={`server-main-content-container ${!isMember ? 'with-banner' : ''}`}>
            <div className="server-main-content">
              {currentChannel ? (
                <div className="chat">
                  <Chat currentChannel={currentChannel} /> {/* <-- integrated Chat component */}
                </div>
              ) : (
                <div className="welcome-message">
                  <div className="welcome-message-header">
                    <h1>Welcome to your {server.name} server</h1>
                  </div>
                  <div className="server-action-items">
                    <p>Select a channel to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServerDetailPage;
