import { useEffect, useState } from "react";
import { HideLoading, ShowLoading } from "../../redux/loaderSlice";
import { getAllMovies } from "../../api/movie";
import { message, Row, Col, Input, Card, Typography, Empty, Tag, Select, Button, Space, Skeleton } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SearchOutlined, CalendarOutlined, ClockCircleOutlined, FilterOutlined, StarOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Meta } = Card;
const { Option } = Select;

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get unique genres and languages for filters
  const genres = [...new Set(movies.map(movie => movie.genre).filter(Boolean))];
  const languages = [...new Set(movies.map(movie => movie.language).filter(Boolean))];

  const getData = async () => {
    try {
      setLoading(true);
      dispatch(ShowLoading());
      const response = await getAllMovies();
      if (response.success) {
        setMovies(response.data);
        setFilteredMovies(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Failed to load movies. Please try again.");
    } finally {
      setLoading(false);
      dispatch(HideLoading());
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    filterAndSortMovies();
  }, [searchText, selectedGenre, selectedLanguage, sortBy, movies]);

  const filterAndSortMovies = () => {
    let filtered = movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           movie.genre?.toLowerCase().includes(searchText.toLowerCase()) ||
                           movie.language?.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesGenre = selectedGenre === "all" || movie.genre === selectedGenre;
      const matchesLanguage = selectedLanguage === "all" || movie.language === selectedLanguage;
      
      return matchesSearch && matchesGenre && matchesLanguage;
    });

    // Sort movies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "duration":
          return (a.duration || 0) - (b.duration || 0);
        case "releaseDate":
          return new Date(b.releaseDate) - new Date(a.releaseDate);
        default:
          return 0;
      }
    });

    setFilteredMovies(filtered);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedGenre("all");
    setSelectedLanguage("all");
    setSortBy("title");
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}?date=${moment().format("YYYY-MM-DD")}`);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Title level={1} style={{ color: '#1a1a2e', marginBottom: '0.5rem', fontSize: '3rem' }}>
          🎬 Discover Amazing Movies
        </Title>
        <Text style={{ fontSize: '1.2rem', color: '#666', display: 'block', marginBottom: '1rem' }}>
          Book your favorite movies at the best theatres near you
        </Text>
        <Text style={{ fontSize: '1rem', color: '#999' }}>
          {movies.length} movies available • Updated daily
        </Text>
      </div>

      {/* Search Section */}
      <Row className="justify-content-center w-100" style={{ marginBottom: '2rem' }}>
        <Col xs={24} lg={16} xl={12}>
          <div className="search-container">
            <Input
              placeholder="Search movies by name, genre, or language..."
              onChange={handleSearch}
              value={searchText}
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              allowClear
              size="large"
              style={{ marginBottom: '1rem' }}
            />
          </div>
        </Col>
      </Row>

      {/* Filters Section */}
      <Row className="justify-content-center" style={{ marginBottom: '2rem' }}>
        <Col xs={24} lg={20} xl={16}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Space wrap size="middle" style={{ width: '100%', justifyContent: 'center' }}>
              <Space align="center">
                <FilterOutlined style={{ color: '#666' }} />
                <Text strong>Filters:</Text>
              </Space>
              
              <Select
                value={selectedGenre}
                onChange={setSelectedGenre}
                style={{ minWidth: 120 }}
                placeholder="Genre"
              >
                <Option value="all">All Genres</Option>
                {genres.map(genre => (
                  <Option key={genre} value={genre}>{genre}</Option>
                ))}
              </Select>

              <Select
                value={selectedLanguage}
                onChange={setSelectedLanguage}
                style={{ minWidth: 120 }}
                placeholder="Language"
              >
                <Option value="all">All Languages</Option>
                {languages.map(language => (
                  <Option key={language} value={language}>{language}</Option>
                ))}
              </Select>

              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ minWidth: 140 }}
                placeholder="Sort by"
              >
                <Option value="title">Title (A-Z)</Option>
                <Option value="duration">Duration</Option>
                <Option value="releaseDate">Release Date</Option>
              </Select>

              <Button onClick={clearFilters} type="default">
                Clear Filters
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Results Summary */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Text style={{ color: '#666', fontSize: '1rem' }}>
          Showing {filteredMovies.length} of {movies.length} movies
          {searchText && ` for "${searchText}"`}
        </Text>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <Row gutter={[24, 32]} className="justify-content-center">
          {[...Array(8)].map((_, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6} xl={6}>
              <Card
                style={{ borderRadius: '12px' }}
                cover={<Skeleton.Image style={{ width: '100%', height: '350px' }} />}
              >
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : filteredMovies.length === 0 && searchText ? (
        <Empty
          description={
            <div>
              <Text style={{ color: '#666', fontSize: '1.1rem', display: 'block', marginBottom: '1rem' }}>
                No movies found for "{searchText}"
              </Text>
              <Button type="primary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          }
          style={{ marginTop: '3rem' }}
        />
      ) : (
        <Row gutter={[24, 32]} className="justify-content-center">
          {filteredMovies.map((movie, index) => (
            <Col
              key={movie._id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={6}
              style={{
                animation: `fadeInUp 0.6s ease forwards`,
                animationDelay: `${index * 0.1}s`,
                opacity: 0
              }}
            >
              <Card
                hoverable
                className="movie-card"
                cover={
                  <div style={{ 
                    height: '350px', 
                    overflow: 'hidden', 
                    position: 'relative',
                    borderRadius: '12px 12px 0 0' 
                  }}>
                    <img
                      alt={movie.title}
                      src={movie.poster}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x450/f0f0f0/666?text=No+Image';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(0,0,0,0.7)',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      <StarOutlined style={{ marginRight: '4px' }} />
                      {movie.rating || '8.5'}
                    </div>
                  </div>
                }
                onClick={() => handleMovieClick(movie._id)}
                bodyStyle={{ padding: '1.5rem' }}
                style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #f0f0f0'
                }}
              >
                <div className="movie-card-content">
                  <Title level={4} style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: '#1a1a2e',
                    lineHeight: '1.3',
                    minHeight: '2.6rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {movie.title}
                  </Title>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    {movie.genre && (
                      <Tag color="blue" style={{ 
                        marginBottom: '0.5rem',
                        borderRadius: '20px',
                        border: 'none',
                        fontWeight: '500'
                      }}>
                        {movie.genre}
                      </Tag>
                    )}
                    {movie.language && (
                      <Tag color="green" style={{ 
                        borderRadius: '20px',
                        border: 'none',
                        fontWeight: '500'
                      }}>
                        {movie.language}
                      </Tag>
                    )}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    {movie.duration && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ClockCircleOutlined />
                        {movie.duration}m
                      </span>
                    )}
                    {movie.releaseDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CalendarOutlined />
                        {moment(movie.releaseDate).format('YYYY')}
                      </span>
                    )}
                  </div>

                  <Button 
                    type="primary" 
                    block 
                    style={{ 
                      marginTop: '1rem',
                      borderRadius: '8px',
                      fontWeight: '600'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMovieClick(movie._id);
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* No Movies Available */}
      {movies.length === 0 && !loading && (
        <Empty
          description={
            <div>
              <Text style={{ color: '#666', fontSize: '1.1rem', display: 'block', marginBottom: '1rem' }}>
                No movies available at the moment
              </Text>
              <Button type="primary" onClick={getData}>
                Refresh
              </Button>
            </div>
          }
          style={{ marginTop: '3rem' }}
        />
      )}

      {/* Back to Top Button */}
      {filteredMovies.length > 8 && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Button 
            type="default" 
            size="large"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ borderRadius: '25px', padding: '0 2rem' }}
          >
            Back to Top ↑
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
