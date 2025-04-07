import React from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex } from 'antd';
import img1 from '../assets/InfantFuel logo-02.png';

function Login() {
    const onFinish = (values) => {
        console.log('Received values of form:', values);
    };

    return (
        <div className='flex justify-start h-lvh'>
            <div className='w-1/2 relative'>
                <p className='absolute top-[60%] mt-2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center text-sm text-[#6F4948]'>
                    Infant Growth and Nutritional Wellness Tracker
                </p>
                <p className='absolute top-[90%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center text-xs text-[#6F4948]'>
                   Copyright © 2024 • EE5206 Software Project.
                </p>
                <img className='h-[500px] w-full object-contain mt-20' src={img1} alt="" />
            </div>
            <div className='w-1/2 bg-[#F7DCCB] p-8'>
                <div className=''>
                    <h1 className='text-[#837EE9] font-bold text-5xl mt-20 mb-8 text-center'>Welcome Back !</h1>
                    <h2 className='text-2xl font-semibold mb-8 ml-32'>Login</h2>
                </div>
                <div className='max-w-md mx-auto'>
                    <Form
                        name="login"
                        initialValues={{
                            remember: true,
                        }}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label={<span className="text-gray-700">Email</span>}
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your e-mail!',
                                },
                            ]}
                        >
                            <Input 
                                prefix={<UserOutlined className="text-gray-400" />}
                                placeholder="Enter your email"
                                className="h-12 rounded-md"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-gray-700">Password</span>}
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your Password!',
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Password"
                                className="h-12 rounded-md"
                            />
                        </Form.Item>

                        <Flex justify="space-between" align="center" className="mb-6">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <a href="" className="text-gray-600">Forgot Password ?</a>
                        </Flex>

                        <Form.Item>
                            <Button 
                                block 
                                type="primary"
                                htmlType="submit"
                                className="h-12 bg-[#837EE9] hover:bg-[#6661E6]"
                            >
                                Login
                            </Button>
                        </Form.Item>

                        <div className="text-center">
                            Don&apos;t have an account ?<a href="/signin" className='text-[#837EE9]'>Register here !</a> 
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
}


export default Login