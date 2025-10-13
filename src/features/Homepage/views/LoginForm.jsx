import React from 'react'
import useAuth from '../../../app/hooks/useAuth.jsx';
import { Row, Col, Card, Button, Typography, Carousel, Space, Form, Input, Flex, Checkbox, notification } from 'antd'
import { useForm, Controller } from "react-hook-form";
import { PlayCircleOutlined, StarFilled, UserOutlined, UnlockOutlined } from '@ant-design/icons'

const LoginForm = () => {
    const { control, handleSubmit, formState: { errors } } = useForm();
    const [api, contextHolder] = notification.useNotification();
    let Auth = useAuth();

    const onSubmit = (data) => {
        console.log("Form submitted:", data);
        Auth.LoginSuccess(data.username, () => {
            api.success({
                message: 'Login Successful',
                description: `Welcome back, ${data.username}!`,
                placement: 'topRight',
            });
        });
    };

    return (
        <div className="bg-transparent border border-gray-300 rounded-xl 
        flex items-center justify-center p-6 hover:border-blue-500 transition-colors duration-500 transform hover:translate-y-[-3px] ease-in-out "
            style={{ zIndex: 10, backdropFilter: "blur(10px) grayscale(50%)" }}>
            {contextHolder}
            <Form
                size="large"
                className="w-full !p-10"
                onFinish={handleSubmit(onSubmit)}
                initialValues={{ remember: true }}
            >
                <Form.Item>
                    <div className="flex flex-col items-center justify-center mb-4">
                        <UnlockOutlined style={{
                            fontSize: '24px',
                            color: '#1890ff',
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '50%',
                        }} />
                        <p className="ml-2 !mt-2" style={{ color: '#1890ff' }}>
                            Đăng nhập đi anh? Tên gì đó...
                        </p>
                    </div>
                </Form.Item>
                <Controller
                    name="username"
                    control={control}
                    rules={{
                        required: "Nhập tên đeee anh ơi!",
                        minLength: { value: 3, message: "Tên phải có ít nhất 3 ký tự!" }
                    }}
                    render={({ field }) => {
                        return (
                            <Form.Item
                                name="username"
                                validateStatus={errors.username ? "error" : ""}
                                help={errors.username ? errors.username.message : ""}
                            >
                                <Input {...field} prefix={<UserOutlined />} placeholder="Nhập tên nè anh ơi." className="rounded-lg" />
                            </Form.Item>
                        );
                    }}
                />
                <Form.Item>
                    <Flex justify="space-between" align="center">
                        <Controller
                            name="remember"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                                <Checkbox {...field} checked={field.value} onChange={(e) => field.onChange(e.target.checked)}>
                                    Remember me
                                </Checkbox>
                            )}
                        />
                        <a href="#forgot">Forgot password</a>
                    </Flex>
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit">
                        Vào đi anh!
                    </Button>
                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                        or <a href="#register">Register now!</a>
                    </div>
                </Form.Item>
            </Form>
        </div>
    )
}

export default LoginForm
