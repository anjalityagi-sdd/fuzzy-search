import { useCallback, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { filter } from './helper/result';
import _ from "lodash";
import SearchBar from './component/SearchBar';
import { Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [distance, setDistance] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState([]);
  useEffect(() => {
    filterData(searchValue, distance, limit, offset)
  }, [searchValue, distance, limit, offset])
  const filterData = useCallback(
    _.debounce((searchValue, distance, limit, offset) => {
      setResults(filter(searchValue, distance, 10000, limit, offset));
    }, 300, {
      leading: false,
      trailing: true,
    }),
    []
  );

  const handleUpdate = useCallback((event) => {
    setDistance(event.target.value);
  }, []);
  const handleLimit = useCallback((event) => {
    setLimit(event.target.value);
  }, []);
  const handleOffset = useCallback((event) => {
    setOffset(event.target.value);
  }, []);
  const handleChange = useCallback((event) => {
    setSearchValue(event.target.value);
  }, []);

  return (
    <Container fluid className="bg-light pt-2 full-height ">
      <Row>
        <Col xs={12} sm={6} lg={4}>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">Search Term</InputGroup.Text>
            <FormControl
              spellCheck="false"
              onChange={handleChange}
              placeholder="Search"
              aria-label="search"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon2">Min Distance</InputGroup.Text>
            <FormControl
              type="number"
              value={distance}
              onChange={handleUpdate}
              placeholder="Distance"
              aria-label="distance"
              aria-describedby="basic-addon2"
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon2">List Offset</InputGroup.Text>
            <FormControl
              type="number"
              value={offset}
              onChange={handleOffset}
              placeholder="List Offset"
              aria-label="offset"
              aria-describedby="basic-addon3"
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon2">List Limit</InputGroup.Text>
            <FormControl
              type="number"
              value={limit}
              onChange={handleLimit}
              placeholder="List Limit"
              aria-label="limit"
              aria-describedby="basic-addon4"
            />
          </InputGroup>
        </Col>
        <Col>
          <SearchBar list={results} />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
