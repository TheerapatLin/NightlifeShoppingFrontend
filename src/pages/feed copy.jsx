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

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImageUrl('');
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://uat-api.healworld.me/api/v1/post");
        setPosts(response.data.reverse()); // reverse the array to show new posts first
        setActiveImageIndex(response.data.map(() => 0));
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
  
    fetchData();
  }, []);
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiSelectorRef.current && !emojiSelectorRef.current.contains(event.target)) {
        setShowEmojiSelector(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              return { ...post, emojiSelected: null };
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
  
  
  
   /*const handleEmojiSelection = async (emoji) => {
    try {
      await axios.post(`https://uat-api.healworld.me/api/v1/post/${selectedPost}/emoji`, { emoji });
      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (post._id === selectedPost) {
            return { ...post, emojiSelected: emoji };
          }
          return post;
        });
      });
      setSelectedPost(null);
      setShowEmojiSelector(false);
    } catch (error) {
      console.error("Error sending emoji:", error);
    }
  };/ */
  
  const handleEmojiSelection = (emoji) => {
    setPosts(prevPosts => {
      return prevPosts.map(post => {
        if (post._id === selectedPost) {
          return { ...post, emojiSelected: emoji };
        }
        return post;
      });
    });
    setSelectedPost(null);
    setShowEmojiSelector(false);
  };


  const handleToggleEmojiSelector = () => {
    setShowEmojiSelector((prevState) => !prevState);
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
  

const handlePost = async () => {
  try {
    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("description", newPost.description);
    for (let i = 0; i < newPost.imageFiles.length; i++) {
      formData.append("image", newPost.imageFiles[i]);
    }
    const response = await axios.post("https://uat-api.healworld.me/api/v1/post", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    // อัพเดตรายการโพสต์โดยเพิ่มโพสต์ใหม่ไปที่ตำแหน่งแรก
    setPosts(prevPosts => [response.data, ...prevPosts]);
    setNewPost({
      userId: "65f9915dcd2c805f76f1e9b8" ,
      title: "",
      description: "",
    });
    setPostModalOpen(false);
  } catch (error) {
    console.error("Error posting:", error);
  }
};
  

  const handleClosePostModal = () => {
    setPostModalOpen(false);
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
            ) : (
              <div className="no-image-available">No images available</div>
            )}
          </div>
          </div>
          <div className="post-footer">
          <div className="post-actions emoji-selector-container">
          <button className="emoji-button" onClick={() => handleEmoji(post._id)}>
  {post.emojiSelected ? (
    <span className="emoji-selected">{post.emojiSelected}</span>
  ) : (
    <img src={imoji} alt="Emoji" />
  )}
</button>
  {showEmojiSelector && selectedPost === post._id && (
   /* <div className="emoji-selector">
      <button onClick={() => handleEmojiSelection("👍")}>👍</button>
      <button onClick={() => handleEmojiSelection("❤️")}>❤️</button>
      <button onClick={() => handleEmojiSelection("😄")}>😄</button>
    </div>
  )} */
  <div className="emoji-selector">
      <button onClick={() => handleEmojiSelection("👍")}>👍</button>
<button onClick={() => handleEmojiSelection("❤️")}>❤️</button>
<button onClick={() => handleEmojiSelection("😄")}>😄</button>
    </div>
  )}

  
  <button>
    <img src={share} alt="Share" />
  </button>
</div>
            <div className="dots3-button">
              <button onClick={() => handleDots3(post._id)}>
                <img src={dots3} alt="dots3" />
              </button>
              {post.showMenu && (
                <div className="dots3-menu">
                  <button className="dots3-menu-item" onClick={() => handleEditPost(post._id)}>EDIT</button>
                  <button className="dots3-menu-item" onClick={() => handleDeletePost(post._id)}>DELETE</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {postModalOpen && (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={handleClosePostModal}>&times;</span>
      <h2>New Post</h2>
      <input type="text" placeholder="Title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
      <textarea placeholder="Description" value={newPost.description} onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}></textarea>
      <div className="file-input-container">
    <label htmlFor="file-input" className="file-input-label">
      <span className="plus-icon">+</span>
    </label>
    <input
      id="file-input"
      type="file"
      multiple
      onChange={(e) => setNewImageFiles(e.target.files)}
      className="file-input"
    />
  </div>
  {newImageFiles.length > 0 && (
    <div className="selected-images">
      {Array.from(newImageFiles).map((file, index) => (
        <div className="image-wrapper">
        <img
          src={URL.createObjectURL(file)}
          alt={`Selected Image ${index + 1}`}
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
        <button className="post-button-confirm" onClick={handlePost}>Post</button>
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
          
          <Slider
            className="post-modal-slider"
            dots={true}
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            beforeChange={(_, next) => setCurrentImageIndex(next)}
          >
            {selectedPost.image.map((image, index) => (
              <div key={index} className="post-modal-image-wrapper">
                <img src={image.fileName} alt={`${selectedPost.title} - ${index}`} className="post-modal-image" />
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
        </div>
      </div>
      <button className="post-modal-close" onClick={closeModal}>
        &times;
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default FeedPage;
