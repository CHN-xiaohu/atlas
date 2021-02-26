import {memo} from "react";
import {useQueryClient} from "react-query";
import {Collapse, Modal, Checkbox, Row, Col} from "antd";
import {defaultAccess} from "../../data/defaultAccess";
import {useDataMutation} from "../../hooks/useDataMutation";

const {Panel} = Collapse;

export const Access = memo(({onClose, user}) => {
    const {access, login} = user;

    const queryClient = useQueryClient();
    const {mutate: changeAll} = useDataMutation("/users/changeAll", {
        onSuccess: () => {
            queryClient.invalidateQueries("users");
        },
    });
    return (
        <Modal width={"50%"} centered visible={true} onCancel={() => onClose(false)} footer={null}>
            <Collapse>
                {Object.keys(defaultAccess).map(category => {
                    const accessForCategory = access[category] ?? {};
                    const enabledCount = Object.values(accessForCategory).filter(acc => acc === true).length;
                    const totalCount = Object.keys(defaultAccess[category]).length;
                    return (
                        <Panel header={category}  extra={`${enabledCount}/${totalCount}`}>
                            <Row>
                                {Object.keys(defaultAccess[category]).map(prop => (
                                    <Col sm={24} md={12} lg={8}>
                                        <Checkbox
                                            onChange={e => {
                                                changeAll({
                                                    login: login,
                                                    key: `access.${category}.${prop}`,
                                                    value: e.target.checked,
                                                });
                                            }}
                                            checked={accessForCategory[prop] ?? defaultAccess[category][prop]}
                                        >
                                            {prop}
                                        </Checkbox>
                                    </Col>
                                ))}
                            </Row>
                        </Panel>
                    );
                })}
            </Collapse>
        </Modal>
    );
});
