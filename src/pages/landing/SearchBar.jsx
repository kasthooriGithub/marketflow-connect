import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const quickCategories = [
    'SEO',
    'Social Media',
    'Logo Design',
    'Video Editing',
    'Web Development'
];

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/services?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleCategoryClick = (category) => {
        navigate(`/services?q=${encodeURIComponent(category)}`);
    };

    return (
        <div className="search-bar-container">
            <form onSubmit={handleSearch} className="position-relative mb-4">
                <div
                    className="d-flex align-items-center bg-white rounded-3"
                    style={{
                        border: isFocused ? '2px solid #0A2540' : '2px solid #E4E5E7',
                        boxShadow: isFocused ? '0 4px 12px rgba(10, 37, 64, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Search className="ms-4" size={20} style={{ color: '#62646A' }} />
                    <input
                        type="text"
                        className="form-control border-0 py-4 px-3"
                        placeholder="Try 'SEO', 'Social Media Ads', 'Logo Design'..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{
                            fontSize: '1.1rem',
                            boxShadow: 'none',
                            color: '#404145'
                        }}
                    />
                    <button
                        type="submit"
                        className="btn m-2 px-5 py-3 fw-semibold"
                        style={{
                            background: '#0A2540',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    >
                        Search
                    </button>
                </div>
            </form>

            <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
                <span className="text-muted small me-2">Popular:</span>
                {quickCategories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className="border-0 px-3 py-2 rounded-pill fw-medium"
                        style={{
                            background: '#F7F7F7',
                            color: '#62646A',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#E4E5E7';
                            e.target.style.color = '#404145';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#F7F7F7';
                            e.target.style.color = '#62646A';
                        }}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
