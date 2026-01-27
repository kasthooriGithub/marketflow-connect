import { AdminLayout } from 'components/layout/AdminLayout';
import { Button } from 'components/ui/button';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { Save, Globe, DollarSign, Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettings() {
  return (
    <AdminLayout title="System Settings">
      <div className="max-w-3xl d-flex flex-column gap-5 mb-5">
        {/* General Settings */}
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                <Globe size={20} />
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">General Configuration</h2>
                <p className="text-muted small mb-0">Manage global site identity and contact info</p>
              </div>
            </div>

            <Form className="d-flex flex-column gap-4">
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Site Name</Form.Label>
                <Form.Control
                  defaultValue="MarketFlow Connect"
                  className="py-2 shadow-none border-light bg-light"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Site Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  defaultValue="The premier marketplace for digital marketing services, connecting experts with ambitious brands."
                  className="py-2 shadow-none border-light bg-light"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">Global Support Email</Form.Label>
                <Form.Control
                  type="email"
                  defaultValue="support@marketflow-connect.com"
                  className="py-2 shadow-none border-light bg-light"
                />
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {/* Commission Settings */}
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div className="p-2 bg-success bg-opacity-10 rounded text-success">
                <DollarSign size={20} />
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">Revenue Model</h2>
                <p className="text-muted small mb-0">Configure fees and commissions for transactions</p>
              </div>
            </div>

            <Form>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary">Client Service Fee (%)</Form.Label>
                    <Form.Control
                      type="number"
                      defaultValue="5"
                      className="py-2 shadow-none border-light bg-light"
                    />
                    <Form.Text className="text-muted extra-small">Added to the client's checkout total</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary">Vendor Commission (%)</Form.Label>
                    <Form.Control
                      type="number"
                      defaultValue="10"
                      className="py-2 shadow-none border-light bg-light"
                    />
                    <Form.Text className="text-muted extra-small">Deducted from vendor earnings per sale</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Feature Toggles */}
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div className="p-2 bg-warning bg-opacity-10 rounded text-warning">
                <SettingsIcon size={20} />
              </div>
              <div>
                <h2 className="h5 fw-bold mb-0">Feature Toggles</h2>
                <p className="text-muted small mb-0">Enable or disable system features instantly</p>
              </div>
            </div>

            <div className="d-flex flex-column gap-1">
              {[
                { label: 'New User Registration', desc: 'Allow new clients and vendors to create accounts', enabled: true },
                { label: 'Vendor Applications', desc: 'Accept new vendor vetting applications', enabled: true },
                { label: 'Marketplace Search', desc: 'Enable public search functionality', enabled: true },
                { label: 'Maintenance Mode', desc: 'Show maintenance page to all non-admin users', enabled: false }
              ].map((item, idx, arr) => (
                <div key={item.label}>
                  <div className="d-flex align-items-center justify-content-between py-3">
                    <div>
                      <p className="fw-bold text-dark mb-0">{item.label}</p>
                      <p className="text-muted small mb-0">{item.desc}</p>
                    </div>
                    <Form.Check
                      type="switch"
                      defaultChecked={item.enabled}
                      className="custom-switch-lg"
                    />
                  </div>
                  {idx < arr.length - 1 && <hr className="my-0 opacity-10" />}
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* Save Button */}
        <div className="d-flex justify-content-end mb-5">
          <Button variant="default" size="lg" className="px-5 py-3 shadow border-0 fw-bold">
            <Save size={20} className="me-2" />
            Save All Changes
          </Button>
        </div>
      </div>
      <style>{`
        .max-w-3xl { max-width: 800px; }
        .extra-small { font-size: 0.7rem; }
        .custom-switch-lg .form-check-input {
            width: 3rem;
            height: 1.5rem;
            cursor: pointer;
        }
      `}</style>
    </AdminLayout>
  );
}
