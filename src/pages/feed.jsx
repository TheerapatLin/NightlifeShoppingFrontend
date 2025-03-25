import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../public/css/Feed.css";
import Slider from "react-slick";
import imoji from "../img/imoji_icon.png";
import share from "../img/share_icon.png";
import dots3 from "../img/3dots_icon.png";
import postIcon from "../img/Newpost_icon.png";
import '@fortawesome/fontawesome-free/css/all.min.css';
import like from '../img/like.png';
import lol from '../img/lol.png';
import loveEye from '../img/loveEye.png';
import sad from '../img/sad.png';
import wow from '../img/wow.png';
import heart from '../img/heart.png';

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState([]);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedEmojis, setSelectedEmojis] = useState({});
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    imageFiles: [],
  });
  const emojiSelectorRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [currentModalImageIndex, setCurrentModalImageIndex] = useState(0);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const [showSendRatingButton, setShowSendRatingButton] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const dots3MenuRef = useRef(null);
  
const [postToDelete, setPostToDelete] = useState(null);
  const handleSendRating = () => {
    window.open('https://your-rating-page.com', '_blank');
  };
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImageUrl('');
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("https://uat-api.healworld.me/api/v1/post/gap");
        setPosts(response.data.reverse());
        setActiveImageIndex(response.data.map(() => 0));
  
        // เรียกฟังก์ชัน fetchUserReactions สำหรับแต่ละโพสต์
        response.data.forEach(post => {
          fetchUserReactions(post._id);
        });
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
  
    fetchData();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dots3MenuRef.current && !dots3MenuRef.current.contains(event.target)) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => ({ ...post, showMenu: false }))
        );
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [userReactions, setUserReactions] = useState({});

  const fetchUserReactions = async (postId) => {
    try {
      const userId = '66119248fdc51ea721a87092'; // เปลี่ยนเป็น User ID ที่ต้องการ
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://uat-api.healworld.me/api/v1/post/${postId}/reactions`,
        headers: {
          'Cookie': 'connect.sid=s%3AxpRhG3sXQ9_MWoxHHBpZ1CEskFQ14Tru.73Lqg41LOXOxN6da7XQ%2BnnA2cPPwe%2BDCODNjVOl3Elg'
        }
      };
  
      const response = await axios.request(config);
      const userReaction = response.data.find(reaction => reaction.userId === userId);
      setUserReactions(prevState => ({
        ...prevState,
        [postId]: userReaction ? userReaction.reactionType : null
      }));
    } catch (error) {
      console.error('Error fetching user reactions:', error);
    }
  };
  
  useEffect(() => {
    posts.forEach(post => {
      fetchUserReactions(post._id);
    });
  }, [posts]);
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  const handleOpenCommentModal = (post) => {
    setSelectedPost(post);
    setCommentModalOpen(true);
  };



  const handleEmoji = (postId) => {
    setSelectedPost((prevSelectedPost) => {
      if (prevSelectedPost === postId) {
        // ยกเลิกการเลือกอีโมจิ
        setPosts((prevPosts) => {
          return prevPosts.map((post) => {
            if (post._id === postId) {
              return { ...post, emojiSelected: null, emojiName: null };
            }
            return post;
          });
        });
        setShowEmojiSelector(false);
        return null;
      } else {
        // เปิดการเลือกอีโมจิ
        setShowEmojiSelector(true);
        return postId;
      }
    });
  };
  

  const sendOrRemoveReaction = async (postId, emojiName, isAdd) => {
    try {
      const userId = "66119248fdc51ea721a87092";
      const emojiId = emojiName.toLowerCase();
  
      const data = JSON.stringify({
        userId,
        reactionType: emojiId,
      });
  
      const config = {
        method: isAdd ? "post" : "delete",
        maxBodyLength: Infinity,
        url: `https://uat-api.healworld.me/api/v1/post/${postId}/reactions`,
        headers: {
          "Content-Type": "application/json",
          Cookie: "connect.sid=s%3Ateh_qP0DSurfuLuBU0glLWmJzP97XdAU.Jg8YVnHYPXb4eaJ7jzbmULYyVIoj80EZqWezxG1Q5IQ",
        },
        data,
      };
  
      const response = await axios.request(config);
      console.log(response.data);
    } catch (error) {
      console.error("Error sending/removing reaction:", error);
    }
  };

  const handleEmojiSelection = (emoji, emojiName) => {
    const postToUpdate = posts.find((post) => post._id === selectedPost);
    if (!postToUpdate) return;
  
    const emojiId = emojiName.toLowerCase();
    const userId = "66119248fdc51ea721a87092"; // เปลี่ยนเป็น User ID ที่ต้องการ
    const currentReaction = userReactions[postToUpdate._id];
  
    if (currentReaction !== emojiId) {
      // รีแอคชันไม่เหมือนกัน ให้ส่งคำขอเพิ่มรีแอคชัน
      sendReaction(postToUpdate._id, emojiName, userId)
        .then(() => {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === postToUpdate._id
                ? { ...post, emojiSelected: emoji, emojiName: emojiName }
                : post
            )
          );
          setUserReactions(prevState => ({
            ...prevState,
            [postToUpdate._id]: emojiId
          }));
          updatePostReactions(postToUpdate._id, emojiId, true);
        })
        .catch((error) => {
          console.error('Error sending reaction:', error);
          // Handle error here, e.g., show an error message
        });
    } else {
      // รีแอคชันเหมือนกัน ให้ส่งคำขอลบรีแอคชัน
      removeReaction(postToUpdate._id, emojiName, userId)
        .then(() => {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === postToUpdate._id
                ? { ...post, emojiSelected: null, emojiName: null }
                : post
            )
          );
          setUserReactions(prevState => ({
            ...prevState,
            [postToUpdate._id]: null
          }));
          updatePostReactions(postToUpdate._id, emojiId, false);
        })
        .catch((error) => {
          console.error('Error removing reaction:', error);
          // Handle error here, e.g., show an error message
        });
    }
  
    setSelectedPost(null);
    setShowEmojiSelector(false);
  };
  const updatePostReactions = (postId, emojiId, isAdd) => {
    setPosts((prevPosts) => {
      return prevPosts.map((post) => {
        if (post._id === postId) {
          const existingReaction = post.reactions?.find(
            (reaction) => reaction._id === emojiId
          );
  
          if (isAdd) {
            const updatedReactions = existingReaction
              ? post.reactions.map((reaction) =>
                  reaction._id === emojiId
                    ? { ...reaction, count: reaction.count + 1 }
                    : reaction
                )
              : [...(post.reactions || []), { _id: emojiId, count: 1 }];
  
            return { ...post, reactions: updatedReactions };
          } else {
            if (existingReaction && existingReaction.count > 1) {
              const updatedReactions = post.reactions.map((reaction) =>
                reaction._id === emojiId
                  ? { ...reaction, count: reaction.count - 1 }
                  : reaction
              );
              return { ...post, reactions: updatedReactions };
            } else {
              const updatedReactions = post.reactions.filter(
                (reaction) => reaction._id !== emojiId
              );
              return { ...post, reactions: updatedReactions };
            }
          }
        }
        return post;
      });
    });
  };
  const handleExpandPost = (postId) => {
    setExpandedPosts((prevExpandedPosts) => {
      if (prevExpandedPosts.includes(postId)) {
        return prevExpandedPosts.filter((id) => id !== postId);
      } else {
        return [...prevExpandedPosts, postId];
      }
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    } else {
      return text;
    }
  };
  const handleDots3 = postId => {
    setPosts(prevPosts => {
      return prevPosts.map(prevPost => {
        if (prevPost._id === postId) {
          return { ...prevPost, showMenu: !prevPost.showMenu };
        }
        return prevPost;
      });
    });
  };
  

  const handlePost = async (isNewPost) => {
    try {
      if (newImageFiles.length === 0 && !newPost.imageFiles.length) {
        alert('Please select at least one image to post.');
        return;
      }
  
      const formData = new FormData();
      formData.append("title", newPost.title);
      formData.append("description", newPost.description);
      formData.append("userId", "65f9915dcd2c805f76f1e9b8");
      for (let i = 0; i < newImageFiles.length; i++) {
        formData.append("image", newImageFiles[i]);
      }
  
      if (isNewPost) {
        const response = await axios.post("https://uat-api.healworld.me/api/v1/post", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
    "Mac-Address": "01-23-45-67-89-AC",
    "Hardware-ID": "11111"
  }
});
  
        // อัพเดตรายการโพสต์โดยเพิ่มโพสต์ใหม่ไปที่ตำแหน่งแรก
        setPosts(prevPosts => [response.data, ...prevPosts]);
      } else {
        console.log(selectedPost)
        const response = await axios({
          method: 'patch',
          url: `https://uat-api.healworld.me/api/v1/post/${selectedPost?._id || ''}`,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
            "Mac-Address": "01-23-45-67-89-AC", 
            "Hardware-ID": "11111"
          }
        });
  
        // อัพเดตโพสต์ที่แก้ไขในรายการโพสต์
        setPosts(prevPosts => prevPosts.map(post => post._id === selectedPost._id ? response.data : post));
      }
  
      setNewPost({
        title: "",
        description: "",
        imageFiles: [],
      });
      setPostModalOpen(false); // ปิด Modal
      window.location.reload(); // รีเฟรชหน้า Feed
    } catch (error) {
      console.error("Error posting:", error);
    }
  };
  

  const handleClosePostModal = () => {
    setPostModalOpen(false);
    setSelectedPost(null);
    setNewPost({
      title: "",
      description: "",
      imageFiles: [],
    });
  };

  const handleOpenPostModal = () => {
    setPostModalOpen(true);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? selectedPost.image.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === selectedPost.image.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const removeImage = (index) => {
    setNewImageFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
  };

  const handleImageClick = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };
  const handleOpenShareModal = (post) => {
    setSelectedPostForShare(post);
    setShowShareModal(true);
  };
  
  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSelectedPostForShare(null);
  };
  const handleCopyLink = () => {
    const postUrl = `https://your-website.com/post/${selectedPostForShare._id}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        alert('Post link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy post link: ', err);
      });
  };
  
  const handleShareFacebook = () => {
    const postUrl = `https://your-website.com/post/${selectedPostForShare._id}`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(shareUrl, '_blank');
  };
  
  const handleShareTwitter = () => {
    const postUrl = `https://your-website.com/post/${selectedPostForShare._id}`;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`;
    window.open(shareUrl, '_blank');
  };
  

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeletePost = async () => {
    try {
      const response = await axios.delete(`https://uat-api.healworld.me/api/v1/post/${postToDelete}`, {
        headers: {
          "Mac-Address": "01-23-45-67-89-AC",
          "Hardware-ID": "11111"
        },
        data: {
          userId: "65f9915dcd2c805f76f1e9b8"
        }
      });
  
      if (response.status === 200) {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postToDelete));
      } else {
        console.error('Error deleting post:', response.data);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  
    setShowDeleteConfirmation(false);
    setPostToDelete(null);
  };
  
  const cancelDeletePost = () => {
    setShowDeleteConfirmation(false);
    setPostToDelete(null);
  };
  const handleEditPost = (post) => {
    setSelectedPost(post);
    setNewPost({
      title: post.title,
      description: post.description,
      imageFiles: post.image,
    });
    setPostModalOpen(true);
  };

  const updatedData = {
    title: 'New Title',
    description: 'New Description',
    // ข้อมูลอื่นๆ ที่ต้องการแก้ไข
  };
  
  // ID ของ POST ที่ต้องการแก้ไข
  const postId = 'YOUR_POST_ID';
  
  let config = {
    method: 'patch',
    maxBodyLength: Infinity,
    url: `https://uat-api.healworld.me/api/v1/post/${postId}`,
    headers: {
      'Content-Type': 'application/json', // ระบุ Content-Type เป็น JSON
      // ส่ง Headers อื่นๆ ที่จำเป็น เช่น Authentication ถ้ามี
    },
    data: updatedData,
  };
  
  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
    const getEmojiFromId = (emojiIdOrName) => {
      const emojiId = emojiIdOrName.toLowerCase();
      switch (emojiId) {
        case 'like':
          return <img src={like} alt="Like" width="30" height="30" />;
        case 'lol':
          return <img src={lol} alt="LOL" width="30" height="30" />;
        case 'love':
          return <img src={loveEye} alt="Love Eye" width="30" height="30" />;
        case 'sad':
          return <img src={sad} alt="Sad" width="30" height="30" />;
        case 'wow':
          return <img src={wow} alt="Wow" width="30" height="30" />;
        case 'heart':
          return <img src={heart} alt="Heart" width="30" height="30" />;
        default:
          return emojiIdOrName;
      }
    };
    const sendReaction = async (postId, emojiName, userId) => {
      try {
        const reactionType = emojiName.toLowerCase();
        const data = JSON.stringify({
          userId,
          reactionType,
        });
    
        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `https://uat-api.healworld.me/api/v1/post/${postId}/reactions`,
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'connect.sid=s%3Ateh_qP0DSurfuLuBU0glLWmJzP97XdAU.Jg8YVnHYPXb4eaJ7jzbmULYyVIoj80EZqWezxG1Q5IQ',
          },
          data,
        };
    
        const response = await axios.request(config);
        console.log(response.data);
      } catch (error) {
        console.error('Error sending reaction:', error);
        // Handle error here, e.g., show an error message
      }
    };
    
    const removeReaction = async (postId, emojiName, userId) => {
      try {
        const reactionType = emojiName.toLowerCase();
    
        const config = {
          method: 'delete',
          maxBodyLength: Infinity,
          url: `https://uat-api.healworld.me/api/v1/post/${postId}/reactions`,
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'connect.sid=s%3Ateh_qP0DSurfuLuBU0glLWmJzP97XdAU.Jg8YVnHYPXb4eaJ7jzbmULYyVIoj80EZqWezxG1Q5IQ',
          },
          data: {
            userId,
            reactionType,
          },
        };
    
        const response = await axios.request(config);
        console.log(response.data);
      } catch (error) {
        console.error('Error removing reaction:', error);
        // Handle error here, e.g., show an error message
      }
    };
    
  return (
    <div className="feed-container">
      {posts.map((post) => (
        <div key={post._id} className="post" id={`post-container-${post._id}`}>
        <div className="post-header">
          <img src={post.userId.userData.profileImage} alt="Profile" className="profile-image" />
          <div className="user-info">
            <h3>{post.userId.user.name}</h3>
            <p>{new Date(post.createdAt).toLocaleString()}</p> {/* เพิ่มข้อมูลเวลาโพสต์ */}
          </div>
        </div>
        <div className="post-body">
  <h2>{post.title}</h2>
  {expandedPosts.includes(post._id) || post.description.split('\n').length <= 4 ? (
    <React.Fragment>
      {post.description.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </React.Fragment>
  ) : (
    <React.Fragment>
      {post.description.split('\n').slice(0, 4).map((line, index) => (
        <p key={index}>{line}</p>
      ))}
      <button className="see-more-button" onClick={() => handleExpandPost(post._id)}>See more</button>
    </React.Fragment>
  )}
 <div className="image-container">
  {post.image.length > 0 ? (
    <Slider {...settings}>
      {post.image.map((image, imageIndex) => (
        <img
          key={imageIndex}
          src={image.fileName}
          alt={`Post ${post.title} - Image ${imageIndex}`}
          className="post-image"
          onClick={() => handleImageClick(post)}
        />
      ))}
    </Slider>
  ) : null}
</div>
<div className="dots3-button">
  <button onClick={() => handleDots3(post._id)}>
    <img src={dots3} alt="dots3" />
  </button>
  {post.showMenu && (
    <div className="dots3-menu" ref={dots3MenuRef}>
      <button className="dots3-menu-item" onClick={() => handleEditPost(post)}>
        EDIT
      </button>
      <button className="dots3-menu-item" onClick={() => handleDeletePost(post._id)}>
        DELETE
      </button>
    </div>
  )}
</div>
          </div>
          <div className="post-footer">
  <div className="post-actions-container">
    <div className="post-actions">
      <div className="emoji-selector-container">
      <button className="emoji-button" onClick={() => handleEmoji(post._id)}>
  {post.emojiSelected ? getEmojiFromId(post.emojiSelected) : <img src={imoji} alt="Emoji" width="24" height="24" />}
</button>
        {showEmojiSelector && selectedPost === post._id && (
          <div className="emoji-selector">

          <button onClick={() => handleEmojiSelection("like", "Like")}>
            <img src={like} alt="Like" />
          </button>
          <button onClick={() => handleEmojiSelection("lol", "LOL")}>
            <img src={lol} alt="LOL" />
          </button>
          <button onClick={() => handleEmojiSelection("love", "Love")}>
            <img src={loveEye} alt="Love" />
          </button>
          <button onClick={() => handleEmojiSelection("sad", "Sad")}>
            <img src={sad} alt="Sad" />
          </button>
          <button onClick={() => handleEmojiSelection("wow", "Wow")}>
            <img src={wow} alt="Wow" />
          </button>
          <button onClick={() => handleEmojiSelection("heart", "Heart")}>
            <img src={heart} alt="Heart" />
          </button>
        </div>
        )}
      </div>
      <button onClick={() => handleOpenShareModal(post)}>
        <img src={share} alt="Share" />
      </button>
      </div>
      {post.reactions && post.reactions.length > 0 && (
  <div className="emoji-stats-container">
    <div className="emoji-stats">
      {post.reactions.map((reaction) => (
        <div key={reaction._id} className="emoji-stat">
          {getEmojiFromId(reaction._id)}
          <span className="count">{reaction.count}</span>
        </div>
      ))}
    </div>
  </div>
)}
  </div>
  {/* ... */}
</div>
        </div>
        
      ))}
      
{postModalOpen && (
  <div className="modal">
    <div className="modal-content">
      <div className="modal-header">
        <h2>{selectedPost ? 'Edit Post' : 'New Post'}</h2>
        <span className="close" onClick={handleClosePostModal}>&times;</span>
      </div>
      <input type="text" placeholder="Title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
      <textarea placeholder="Description" value={newPost.description} onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}></textarea>
      <div className="file-input-container">
        <label htmlFor="file-input" className="file-input-label">
          {newPost.imageFiles.length > 0 ? `${newPost.imageFiles.length} images selected` : 'Select images'}
        </label>
        <input
          id="file-input"
          type="file"
          multiple
          onChange={(e) => setNewImageFiles(e.target.files)}
          className="file-input"
        />
      </div>
      {(newImageFiles.length > 0 || newPost.imageFiles.length > 0) && (
        <div className="selected-images">
          {newPost.imageFiles.map((file, index) => (
            <div className="image-wrapper" key={index}>
              <img
                src={file.fileName}
                alt={`Selected Image ${index + 1}`}
                className="selected-image"
              />
            </div>
          ))}
          {Array.from(newImageFiles).map((file, index) => (
            <div className="image-wrapper" key={newPost.imageFiles.length + index}>
              <img
                src={URL.createObjectURL(file)}
                alt={`Selected Image ${newPost.imageFiles.length + index + 1}`}
                className="selected-image"
              />
              <button className="remove-image-button" onClick={() => removeImage(index)}>
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="modal-buttons">
        <button className="post-button-confirm" onClick={() => handlePost(selectedPost ? false : true)}>
          {selectedPost ? 'Update Post' : 'Post'}
        </button>
      </div>
    </div>
  </div>
)}



{!postModalOpen && (
  <button className="post-button" onClick={() => setPostModalOpen(true)}>
    <img src={postIcon} alt="Post" />
  </button>
)}


{showModal && (
  <div className="post-modal-overlay" onClick={closeModal}>
    <div className="post-modal" onClick={(e) => e.stopPropagation()}>
      <div className="post-modal-container">
        <div className="post-modal-left">
          <Slider {...settings} className="post-modal-slider">
            {selectedPost.image.map((image, imageIndex) => (
              <div key={imageIndex} className="post-modal-image-container">
                <img
                  src={image.fileName}
                  alt={`Post ${selectedPost.title} - Image ${imageIndex}`}
                  className="post-modal-image"
                />
              </div>
            ))}
          </Slider>
        </div>
        <div className="post-modal-right">
          <div className="post-header">
            <img src={selectedPost.userId.userData.profileImage} alt="Profile" className="profile-image" />
            <div className="user-info">
              <h3>{selectedPost.userId.user.name}</h3>
              <p>{new Date(selectedPost.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <h2>{selectedPost.title}</h2>
          <p>{selectedPost.description}</p>
          {/* เพิ่มข้อมูลอื่นๆ ของโพสต์ที่ต้องการแสดง */}
        </div>
      </div>
      <button className="post-modal-close" onClick={closeModal}>
        &times;
      </button>
    </div>
  </div>
)}

{showShareModal && (
  <div className="share-modal-overlay" onClick={handleCloseShareModal}>
    <div className="share-modal" onClick={(e) => e.stopPropagation()}>
      <div className="share-modal-header">
        <h3>Share Post</h3>
        <button className="share-modal-close" onClick={handleCloseShareModal}>
          &times;
        </button>
      </div>
      <div className="share-modal-body">
  <div className="share-option" onClick={handleCopyLink}>
    <i className="fa fa-link" aria-hidden="true"></i>
    <span>Copy Link</span>
  </div>
  <div className="share-option" onClick={handleShareFacebook}>
  <i className="fab fa-facebook-f" aria-hidden="true"></i>
    <span>Facebook</span>
  </div>
  <div className="share-option" onClick={handleShareTwitter}>
  <i className="fab fa-twitter" aria-hidden="true"></i>
    <span>Twitter</span>
  </div>
  {/* เพิ่มตัวเลือกการแชร์อื่นๆ ที่ต้องการ */}
</div>
    </div>
  </div>
)}
{showDeleteConfirmation && (
  <div className="delete-confirm-modal">
    <div className="delete-confirm-modal-content">
      
      <p>Are you sure you want to delete this post?</p>
      <div className="modal-buttons">
        <button className="cancel-button" onClick={cancelDeletePost}>Cancel</button>
        <button className="confirm-button" onClick={confirmDeletePost}>Delete</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default FeedPage;