import { useState, useEffect } from "react";

export default function SalesforceChatterFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    // Load credentials from localStorage on component mount
    const storedCredentials = localStorage.getItem("sfAuthData");
    if (storedCredentials) {
      try {
        setCredentials(JSON.parse(storedCredentials));
      } catch (err) {
        setError("Invalid credentials stored. Please log in again.");
      }
    } else {
      setError("No Salesforce credentials found. Please log in first.");
    }
  }, []);

  useEffect(() => {
    // Fetch posts when credentials are available
    if (credentials?.accessToken && credentials?.instanceUrl) {
      fetchChatterPosts();
    }
  }, [credentials]);

  const fetchChatterPosts = async () => {
    try {
      if (!credentials?.accessToken || !credentials?.instanceUrl) {
        setError("Access token and instance URL are required");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/salesforceChatter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: credentials.accessToken,
          instanceUrl: credentials.instanceUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch Chatter posts");
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchChatterPosts();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const highlightMentions = (text) => {
    if (!text) return ""; // Return an empty string if text is null or undefined
    const mentionRegex = /@(\w+)/g; // Matches mentions like @username
    return text.replace(mentionRegex, '<span class="text-blue-600 font-bold">@$1</span>');
  };
  
  const getPostTypeIcon = (type) => {
    switch (type) {
      case "TextPost":
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
      case "LinkPost":
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
      case "ContentPost":
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>;
      default:
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line></svg>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Salesforce Chatter Feed</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          {credentials && (
            <p className="text-sm text-gray-600">
              Connected to: <span className="font-medium">{credentials.instanceUrl}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path></svg>
          Refresh Posts
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error: {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No chatter posts found.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.Id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-start">
                <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center text-gray-700 font-semibold mr-3">
                  {post.CreatedBy?.Name?.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-800">{post.CreatedBy?.Name}</h3>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{formatDate(post.CreatedDate)}</span>
                    <div className="ml-auto flex items-center space-x-2">
                      {getPostTypeIcon(post.Type)}
                      {post.Type && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {post.Type.replace('Post', '')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {post.Title && (
                    <h4 className="font-medium text-gray-800 mt-1">{post.Title}</h4>
                  )}
                  
                  <div 
                    className="mt-2 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: highlightMentions(post.Body) }}
                  />
                  
                  {post.LinkUrl && (
                    <a 
                      href={post.LinkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center text-blue-600 hover:underline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      View Linked Content
                    </a>
                  )}
                  
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <div className="flex items-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      {post.LikeCount || 0} Likes
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      {post.CommentCount || 0} Comments
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// import React, { useEffect, useState } from "react";
// import { format } from "date-fns";

// const SalesforceChatterPage = () => {
//   const [chatterData, setChatterData] = useState({
//     feedItems: [],
//     currentUser: null
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [newPost, setNewPost] = useState("");
//   const [postingStatus, setPostingStatus] = useState({ loading: false, error: "" });
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   useEffect(() => {
//     const fetchChatterPosts = async () => {
//       try {
//         setLoading(true);
//         const sfAuthData = localStorage.getItem("sfAuthData");
//         if (!sfAuthData) {
//           setError("Missing Salesforce credentials in localStorage.");
//           setLoading(false);
//           return;
//         }
    
//         const { accessToken, instanceUrl } = JSON.parse(sfAuthData);
//         console.log("Fetching Chatter posts with accessToken:", accessToken, "and instanceUrl:", instanceUrl);
//         const response = await fetch("/api/salesforceChatter", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ accessToken, instanceUrl }),
//         });
//         console.log("Response status:", response.status);
//         if (!response.ok) {
//           throw new Error("Failed to fetch Chatter posts.");
//         }
    
//         const data = await response.json();
//         setChatterData(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChatterPosts();
//   }, [refreshTrigger]);

//   const handleSubmitPost = async (e) => {
//     e.preventDefault();
//     if (!newPost.trim()) return;

//     try {
//       setPostingStatus({ loading: true, error: "" });
//       const sfAuthData = localStorage.getItem("sfAuthData");
//       if (!sfAuthData) {
//         setPostingStatus({ loading: false, error: "Missing Salesforce credentials." });
//         return;
//       }
  
//       const { accessToken, instanceUrl } = JSON.parse(sfAuthData);
  
//       const response = await fetch("/api/salesforceChatter", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ 
//           accessToken, 
//           instanceUrl, 
//           postText: newPost 
//         }),
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to post message.");
//       }
  
//       // Clear the form and refresh posts
//       setNewPost("");
//       setRefreshTrigger(prev => prev + 1);
//     } catch (err) {
//       setPostingStatus({ loading: false, error: err.message });
//     } finally {
//       setPostingStatus({ loading: false, error: "" });
//     }
//   };

//   const formatDate = (dateStr) => {
//     try {
//       return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
//     } catch (e) {
//       return dateStr;
//     }
//   };

//   // Determine the post icon based on the type
//   const getPostIcon = (type) => {
//     switch (type) {
//       case "TextPost":
//         return "💬";
//       case "LinkPost":
//         return "🔗";
//       case "ContentPost":
//         return "📄";
//       case "UserStatus":
//         return "👤";
//       default:
//         return "📝";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
//         <div className="flex">
//           <div className="flex-shrink-0">
//             <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
//             </svg>
//           </div>
//           <div className="ml-3">
//             <h3 className="text-sm font-medium text-red-800">Error</h3>
//             <div className="mt-2 text-sm text-red-700">
//               <p>{error}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <div className="bg-white shadow rounded-lg p-6 mb-6">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">Salesforce Chatter</h1>
        
//         {/* New Post Form */}
//         <div className="mb-8 bg-gray-50 p-4 rounded-lg">
//           <form onSubmit={handleSubmitPost}>
//             <div className="mb-4">
//               <textarea
//                 value={newPost}
//                 onChange={(e) => setNewPost(e.target.value)}
//                 placeholder="Share an update..."
//                 className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 rows="3"
//                 required
//               ></textarea>
//             </div>
//             <div className="flex justify-between items-center">
//               <div>
//                 {postingStatus.error && (
//                   <p className="text-red-500 text-sm">{postingStatus.error}</p>
//                 )}
//               </div>
//               <button
//                 type="submit"
//                 disabled={postingStatus.loading || !newPost.trim()}
//                 className={`px-4 py-2 rounded-md text-white ${
//                   postingStatus.loading || !newPost.trim()
//                     ? "bg-blue-300"
//                     : "bg-blue-600 hover:bg-blue-700"
//                 }`}
//               >
//                 {postingStatus.loading ? "Posting..." : "Share"}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Feed Items */}
//         {chatterData.feedItems?.length > 0 ? (
//           <div className="space-y-6">
//             {chatterData.feedItems.map((post) => (
//               <div key={post.Id} className="border border-gray-200 rounded-lg overflow-hidden">
//                 <div className="p-4 bg-white">
//                   {/* Post Header */}
//                   <div className="flex items-center mb-3">
//                     <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
//                       {post.CreatedBy?.SmallPhotoUrl ? (
//                         <img 
//                           src={post.CreatedBy.SmallPhotoUrl} 
//                           alt={post.CreatedBy.Name} 
//                           className="h-full w-full object-cover"
//                         />
//                       ) : (
//                         <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-medium">
//                           {post.CreatedBy?.Name?.charAt(0) || "U"}
//                         </div>
//                       )}
//                     </div>
//                     <div className="ml-3">
//                       <p className="font-medium text-gray-900">{post.CreatedBy?.Name}</p>
//                       <div className="flex items-center text-sm text-gray-500">
//                         <span>{post.CreatedBy?.Title || "Salesforce User"}</span>
//                         <span className="mx-1">•</span>
//                         <span>{formatDate(post.CreatedDate)}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Post Type Indicator */}
//                   <div className="text-xs text-gray-500 mb-2 flex items-center">
//                     <span className="mr-1">{getPostIcon(post.Type)}</span>
//                     <span>{post.Type?.replace("Post", " Post") || "Post"}</span>
//                   </div>
                  
//                   {/* Post Title if available */}
//                   {post.Title && (
//                     <h3 className="font-semibold text-lg mb-2">{post.Title}</h3>
//                   )}
                  
//                   {/* Post Body */}
//                   <div className="text-gray-800 whitespace-pre-wrap mb-3">{post.Body}</div>
                  
//                   {/* Link if available */}
//                   {post.LinkUrl && (
//                     <a 
//                       href={post.LinkUrl}
//                       target="_blank" 
//                       rel="noopener noreferrer" 
//                       className="text-blue-600 hover:underline block mb-3"
//                     >
//                       {post.LinkUrl}
//                     </a>
//                   )}
                  
//                   {/* Post Stats */}
//                   <div className="flex items-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
//                     {post.LikeCount > 0 && (
//                       <div className="flex items-center mr-4">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
//                         </svg>
//                         <span>{post.LikeCount} {post.LikeCount === 1 ? 'like' : 'likes'}</span>
//                       </div>
//                     )}
//                     {post.CommentCount > 0 && (
//                       <div className="flex items-center">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//                         </svg>
//                         <span>{post.CommentCount} {post.CommentCount === 1 ? 'comment' : 'comments'}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 {/* Comments Section */}
//                 {post.comments && post.comments.length > 0 && (
//                   <div className="bg-gray-50 p-4 border-t border-gray-200">
//                     <h4 className="text-sm font-medium text-gray-700 mb-3">Comments</h4>
//                     <div className="space-y-4">
//                       {post.comments.map(comment => (
//                         <div key={comment.id} className="flex">
//                           <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
//                             {comment.user?.photo?.smallPhotoUrl ? (
//                               <img 
//                                 src={comment.user.photo.smallPhotoUrl} 
//                                 alt={comment.user.name} 
//                                 className="h-full w-full object-cover"
//                               />
//                             ) : (
//                               <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-medium">
//                                 {comment.user?.name?.charAt(0) || "U"}
//                               </div>
//                             )}
//                           </div>
//                           <div className="ml-3 flex-1">
//                             <div className="bg-white p-3 rounded-lg shadow-sm">
//                               <p className="font-medium text-gray-800 text-sm">{comment.user?.name}</p>
//                               <p className="text-gray-700 text-sm">{comment.body?.text}</p>
//                             </div>
//                             <p className="text-xs text-gray-500 mt-1">
//                               {formatDate(comment.createdDate)}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12 bg-gray-50 rounded-lg">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//             </svg>
//             <p className="mt-4 text-gray-600">No Chatter posts found.</p>
//             <p className="text-sm text-gray-500 mt-2">Be the first to share an update!</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SalesforceChatterPage;