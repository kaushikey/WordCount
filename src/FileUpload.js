import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Card from './Card';
import './fileupload.css';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [wordCounts, setWordCounts] = useState([]);
  const [coOccurringWords, setCoOccurringWords] = useState([]);
  const [allWordCounts, setAllWordCounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFileTerm, setSearchFileTerm] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const handleOutsideClick = (event) => {
    if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (file.size <= 5 * 1024 * 1024 && file.name.endsWith('.txt')) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('http://localhost:5000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setWordCounts(response.data.topWords);
        setCoOccurringWords(response.data.topCoOccurringWords);
        setAllWordCounts(response.data.wordCounts);

        const insertResponse = await axios.post('http://localhost:5000/insert_file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setUploadedFiles([insertResponse.data, ...uploadedFiles]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      alert('File must be less than 5MB and have a .txt extension.');
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/search?filename=${searchFileTerm}`);

      setWordCounts(response.data.topWords);
      setCoOccurringWords(response.data.topCoOccurringWords);
      setAllWordCounts(response.data.wordCounts);
      setUploadedFiles(response.data);
      setShowDropdown(false);
    } catch (error) {
      console.log('No data found');
      alert('No file found for the given name!');
      setShowDropdown(false);
    }
  };

  const handleRecentUploads = async () => {
    try {
      const response = await axios.get('http://localhost:5000/recent-uploads');
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error retrieving recent uploads:', error);
    }
  };

  const handleDropdownClick = (event) => {
    event.stopPropagation(); // Prevent the dropdown from closing when clicked
  };

  const handleDropdownItemClick = (filename) => {
    setSearchFileTerm(filename);
    setShowDropdown(false);
  };

  const filteredAllWordCounts = allWordCounts.filter(
    (wordCount) =>
      wordCount[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
      wordCount[1].toString().includes(searchTerm)
  );

  return (
    <div className="FileUpload">
      <div className="left-section">
        <h2>File Upload and Word Count</h2>
        <input type="file" accept=".txt" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        <div className="search-container">
          <input
            type="text"
            placeholder="File Search.."
            value={searchFileTerm}
            onChange={(e) => setSearchFileTerm(e.target.value)}
            onClick={() => {
              setShowDropdown(true);
              handleRecentUploads();
            }}
            ref={searchInputRef}
          />
          <button onClick={handleSearch}>Search</button>

          {showDropdown && (
            <div className="dropdown" ref={dropdownRef} onClick={handleDropdownClick}>
            <div style={{backgroundColor:'grey'}}>Recents...</div>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleDropdownItemClick(result.filename)}
                >
                  {result.filename}
                </div>
              ))}
            </div>
          )}
        </div>
        {wordCounts.length > 0 && (
          <div>
            <h3>Top 5 Words</h3>
            <div className="card-deck">
              {wordCounts.slice(0, 5).map((wordCount, index) => (
                <Card key={index} title={wordCount[0]} content={`Count: ${wordCount[1]}`} />
              ))}
            </div>
          </div>
        )}
        {coOccurringWords.length > 0 && (
          <div>
            <h3>Top 5 Co-Occurring Word Pairs</h3>
            <div className="card-deck">
              {coOccurringWords.slice(0, 5).map((coOccurringWord, index) => (
                <Card key={index} title={coOccurringWord[0]} content={`Count: ${coOccurringWord[1]}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="right-section">
        {allWordCounts.length > 0 && (
          <div>
            <h3>All word count</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button>Search</button>
            </div>
            <div className="all-word-count-container">
              <div className="scroll-container">
                <div className="card-deck">
                  {filteredAllWordCounts.map((allWordCount, index) => (
                    <Card key={index} title={allWordCount[0]} content={`Count: ${allWordCount[1]}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
