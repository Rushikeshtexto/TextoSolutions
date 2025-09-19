import React,{useState} from 'react'
import { Button, Form, Row, Col, Card } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Header from '../header/Header';


const Segments = () => {

    const [conditions, setConditions] = useState([
        { id: "1", field: "city", operator: "equals", value: "" },
        { id: "2", field: "tier", operator: "equals", value: "" },
      ]);
    
      const [logic, setLogic] = useState("AND");
    
      // Handle drag end
      const handleDragEnd = (result) => {
        if (!result.destination) return;
        const reordered = Array.from(conditions);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        setConditions(reordered);
      };
    
      const updateCondition = (index, key, value) => {
        const newConditions = [...conditions];
        newConditions[index][key] = value;
        setConditions(newConditions);
      };
    
      const addCondition = () => {
        setConditions([
          ...conditions,
          { id: Date.now().toString(), field: "city", operator: "equals", value: "" },
        ]);
      };
    
      const removeCondition = (index) => {
        setConditions(conditions.filter((_, i) => i !== index));
      };
    
      const segmentStructure = { logic, conditions };
  return (
    <>
    <Header/>
    <Card className="p-3 shadow-sm">
      <h3 className="mb-3">Segment Builder</h3>

      <Form>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="conditions">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {conditions.map((cond, index) => (
                  <Draggable key={cond.id} draggableId={cond.id} index={index}>
                    {(provided) => (
                      <Row
                        className="align-items-center mb-2 p-2 border rounded bg-light"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {/* Field */}
                        <Col>
                          <Form.Select
                            value={cond.field}
                            onChange={(e) =>
                              updateCondition(index, "field", e.target.value)
                            }
                          >
                            <option value="city">City</option>
                            <option value="tier">Customer Tier</option>
                            <option value="purchaseAmount">Purchase Amount</option>
                            <option value="lastPurchase">
                              Last Purchase (days ago)
                            </option>
                          </Form.Select>
                        </Col>

                        {/* Operator */}
                        <Col>
                          <Form.Select
                            value={cond.operator}
                            onChange={(e) =>
                              updateCondition(index, "operator", e.target.value)
                            }
                          >
                            <option value="equals">Equals</option>
                            <option value="not_equals">Not Equals</option>
                            <option value="greater_than">Greater Than</option>
                            <option value="less_than">Less Than</option>
                            <option value="contains">Contains</option>
                          </Form.Select>
                        </Col>

                        {/* Value */}
                        <Col>
                          <Form.Control
                            type="text"
                            placeholder="Enter value"
                            value={cond.value}
                            onChange={(e) =>
                              updateCondition(index, "value", e.target.value)
                            }
                          />
                        </Col>

                        {/* Remove button */}
                        <Col xs="auto">
                          <Button
                            variant="danger"
                            onClick={() => removeCondition(index)}
                          >
                            ✖
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Logic Selector */}
        <Form.Group className="mb-3 mt-3">
          <Form.Label>Combine conditions with</Form.Label>
          <Form.Select
            value={logic}
            onChange={(e) => setLogic(e.target.value)}
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" onClick={addCondition}>
          ➕ Add Condition
        </Button>
      </Form>

      <Card className="mt-3 p-3 bg-dark text-white">
        <h5>Segment JSON Output:</h5>
        <pre>{JSON.stringify(segmentStructure, null, 2)}</pre>
      </Card>
    </Card>
    </>
  );
  
}

export default Segments