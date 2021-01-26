import React from 'react'
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { BottomBar } from "../pages/App";
import 'react-mount'
import 'react-tools'

Enzyme.configure({adapter: new Adapter() });

// test('chatBox', function()
// {
//     render(<Na title="test"><div id="demo"></div></App>)
//     const demo = document.querySelector('#demo')
//     except(demo).not.toBeNull()
// })

// describe('BottomBar', () => {
//     it('validates model on button click', () => {
//         const validateSpy = jest.fn();
//         const wrapper = Enzyme.shallow(<InputBase validateSpy={validateSpy}/>);
//         const instance = wrapper.instance();
//         wrapper
//           .find('.InputBase')
//           .at(0)
//           .simulate('keypress', {key: 'Enter'})
//         expect(validateSpy).toHaveBeenCalledTimes(1);
//       });
//     });

// describe("App", () => 
// {
//     let wrapper;
//     const setState = jest.fn();
//     const useStateSpy = jest.spyOn(React, "useState")
//     useStateSpy.mockImplementation((init) => [init, setState]);

//     beforeEach(() => {
//         wrapper = Enzyme.mount(Enzyme.shallow(<NewPost />).get(0))
//     });

//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     describe("Title input", () => {
//         it("Should capture title correctly onChange", () => {
//             const title = wrapper.find("input").at(0);
//             title.instance().value = "Test";
//             title.simulate("change");
//             expect(setState).toHaveBeenCalledWith("Test");
//         });
//     });

//     describe("Content input", () => {
//         it("Should capture content correctly onChange", () => {
//             const content = wrapper.find("input").at(1);
//             content.instance().value = "Testing";
//             content.simulate("change");
//             expect(setState).toHaveBeenCalledWith("Testing");
//         });
//     });
// });

describe('BottomBar', () => 
{
    it('AppBar exist ', () => 
    {
        const wrapper = Enzyme.shallow(<BottomBar />);
        expect(wrapper.exists()).toBe(true);
    });

    // it('Toolbar exist ', () => 
    // {
    //     const wrapper = Enzyme.shallow(<Toolbar />);
    //     expect(wrapper.exists()).toBe(true);
    // });

    // it('InputBase exist ', () => 
    // {
    //     const wrapper = Enzyme.shallow(<InputBase />);
    //     expect(wrapper.exists()).toBe(true);
    // });
});
