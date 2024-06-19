
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [view, setView] = useState('all'); // 'all', 'approved', 'rejected', 'reviewLater'
  const [rejectedProducts, setRejectedProducts] = useState([]);
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [reviewLaterProducts, setReviewLaterProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewMode, setReviewMode] = useState(false); // New state for review mode
  const [currentPageApproved, setCurrentPageApproved] = useState(0);
  const [currentPageRejected, setCurrentPageRejected] = useState(0);
  const [currentPageReviewLater, setCurrentPageReviewLater] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8); // Number of items per page
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false); // State to manage reject confirmation dialog

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/products');
      setProducts(response.data);
      setSelectedProduct(response.data[0]); // Select the first product by default
      filterProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const filterProducts = (products) => {
    const approved = products.filter(product => product.status === 'Approved');
    const rejected = products.filter(product => product.status === 'Rejected');
    const reviewLater = products.filter(product => product.status === 'ReviewLater');
    
    setApprovedProducts(approved);
    setRejectedProducts(rejected);
    setReviewLaterProducts(reviewLater);
  };

  const handleStatusUpdate = async (product, newStatus) => {
    try {
      await axios.put(`http://localhost:3001/products/${product.id}`, { status: newStatus });
      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedProduct) return;
    await handleStatusUpdate(selectedProduct, 'Approved');
    if (view === 'approved') {
      fetchProducts(); // Refresh the list if already viewing approved products
    }
  };

  const handleReject = async () => {
    if (!selectedProduct) return;
    // Show confirmation dialog before rejecting
    setShowRejectConfirmation(true);
  };

  const confirmReject = async () => {
    // User confirmed rejection, proceed with status update
    await handleStatusUpdate(selectedProduct, 'Rejected');
    if (view === 'rejected') {
      fetchProducts(); // Refresh the list if already viewing rejected products
    }
    // Close the confirmation dialog
    setShowRejectConfirmation(false);
  };

  const cancelReject = () => {
    // User cancelled rejection, close the confirmation dialog
    setShowRejectConfirmation(false);
  };

  const handleReviewLater = async () => {
    if (!selectedProduct) return;
    await handleStatusUpdate(selectedProduct, 'ReviewLater');
    if (view === 'reviewLater') {
      fetchProducts(); // Refresh the list if already viewing review later products
    }
  };

  const handleNextPageApproved = () => {
    setCurrentPageApproved(currentPageApproved + 1);
  };

  const handlePreviousPageApproved = () => {
    setCurrentPageApproved(currentPageApproved - 1);
  };

  const handleNextPageRejected = () => {
    setCurrentPageRejected(currentPageRejected + 1);
  };

  const handlePreviousPageRejected = () => {
    setCurrentPageRejected(currentPageRejected - 1);
  };

  const handleNextPageReviewLater = () => {
    setCurrentPageReviewLater(currentPageReviewLater + 1);
  };

  const handlePreviousPageReviewLater = () => {
    setCurrentPageReviewLater(currentPageReviewLater - 1);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % products.length;
    setSelectedProduct(products[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const handlePrevious = () => {
    const previousIndex = (currentIndex - 1 + products.length) % products.length;
    setSelectedProduct(products[previousIndex]);
    setCurrentIndex(previousIndex);
  };

  const renderProductList = (productList, currentPage, handleNextPage, handlePreviousPage) => {
    // Calculate pagination range
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = productList.slice(startIndex, endIndex);

    return (
      <div style={{ marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f8ff', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Images</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Approved On</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', verticalAlign: 'top' }}>
                  <img src={product.product_image_uri} alt="Product Thumbnail" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                </td>
                <td style={{ padding: '10px', verticalAlign: 'top' }}>
                  {formatDate(product.updated_at)} {/* Display the formatted date */}
                </td>
                <td style={{ padding: '10px', verticalAlign: 'top' }}>
                  <a href="/" style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}>Analyze Again</a>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>
                {currentPage > 0 && (
                  <button onClick={handlePreviousPage} style={{ marginRight: '10px' }}>Previous Page</button>
                )}
                {endIndex < productList.length && (
                  <button onClick={handleNextPage}>Next Page</button>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  // Function to format date as MM/DD/YYYY
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp') {
        // Implement logic to save updated metadata
        console.log('Saving updated metadata...');
      } else if (event.key === 'ArrowDown') {
        // Implement logic to delete current image
        console.log('Deleting current image...');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: '#f5c500', fontWeight: 'bold', marginTop: 0 }}>INHABITR</h1>
      <hr style={{ borderColor: '#ddd', width: '100%', marginBottom: '20px' }} />

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '14px' }}>KEYBOARD SHORTCUT</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: '14px', marginRight: '20px' }}>↑ Key Saves the Updated Image Metadata</p>
          <p style={{ fontSize: '14px' }}>↓ Key Deletes the Current Image</p>
        </div>
      </div>

      <hr style={{ borderColor: '#ddd', width: '100%', marginBottom: '20px' }} />

      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
        <button
          type="button"
          onClick={() => { setView('all'); setReviewMode(false); }}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid white',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Analyse
        </button>
        <button
          type="button"
          onClick={() => setView('approved')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid white',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Approved
        </button>
        <button
          type="button"
          onClick={() => setView('rejected')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid white',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Rejected
        </button>
        <button
          type="button"
          onClick={() => setView('reviewLater')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid white',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Review Later
        </button>
      </div>

      {!reviewMode && view === 'approved' && (
        renderProductList(approvedProducts, currentPageApproved, handleNextPageApproved, handlePreviousPageApproved)
      )}
      {!reviewMode && view === 'rejected' && (
        renderProductList(rejectedProducts, currentPageRejected, handleNextPageRejected, handlePreviousPageRejected)
      )}
      {!reviewMode && view === 'reviewLater' && (
        renderProductList(reviewLaterProducts, currentPageReviewLater, handleNextPageReviewLater, handlePreviousPageReviewLater)
      )}

      {products.length > 0 && (view === 'all' || reviewMode) && (
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', position: 'relative' }}>
          <div style={{ width: '60%', minWidth: '300px', overflow: 'hidden' }}>
            {selectedProduct && (
              <div style={{ border: '1px solid #ddd', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', minHeight: '400px', position: 'relative' }}>
                <img src={selectedProduct.product_image_uri} alt="Product" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    display: 'flex',
                    gap: '10px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <button
                    onClick={handleApprove}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#1E90FF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#FF6347',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleReviewLater}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#FFD700',
                      color: 'black',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Review Later
                  </button>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  <button
                    type="button"
                    onClick={handlePrevious}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#1e90ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#1e90ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          <div style={{ width: '40%', minHeight: '400px', overflow: 'hidden' }}>
            {selectedProduct && (
              <div style={{ border: '1px solid #ddd', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', minHeight: '400px' }}>
                <h3>Product Details</h3>
                <div style={{ backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
                  <p><strong>ID:</strong> {selectedProduct.id}</p>
                  <p><strong>Product ID:</strong> {selectedProduct.fdc_product_id}</p>
                  <p><strong>Name:</strong> {selectedProduct.name}</p>
                  <p><strong>Product Image URI:</strong> {selectedProduct.product_image_uri} </p>
                  <p><strong>Description:</strong> {selectedProduct.product_description}</p>
                  <p><strong>Dimensions:</strong> {selectedProduct.product_dimensions}</p>
                  <p><strong>Created At:</strong> {selectedProduct.created_at}</p>
                  <p><strong>Updated At:</strong> {selectedProduct.updated_at}</p>
                  <p><strong>Price:</strong> ${selectedProduct.price}</p>
                  <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>
                  <p><strong>Status:</strong> {selectedProduct.status}</p>
                  <p><strong>Approved Date:</strong> {selectedProduct.updated_at ? formatDate(selectedProduct.updated_at) : ''}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Reject */}
      {showRejectConfirmation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.3)', maxWidth: '400px', textAlign: 'center' }}>
            <p>Are you sure you want to delete the image?</p>
            <p>This action cannot be undone.</p>
            <div style={{ marginTop: '20px' }}>
              <button onClick={confirmReject} style={{ padding: '10px 20px', backgroundColor: '#FF6347', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>Delete</button>
              <button onClick={cancelReject} style={{ padding: '10px 20px', backgroundColor: '#ddd', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
