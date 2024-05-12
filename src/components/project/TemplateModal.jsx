import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useAtomValue } from "jotai";
import React, { useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { FaCheck } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useQuery } from "react-query";
import { fetchRepos } from "../../apis/user";
import { ReactComponent as GithubIcon } from "../../assets/github.svg";
import useModal from "../../hooks/useModal";
import { modalAtom, userAtom } from "../../store";
import { icons } from "../../utils/constant";

export default function TemplateModal() {
  const { closeModal } = useModal();
  const modal = useAtomValue(modalAtom);
  const user = useAtomValue(userAtom);
  const [repoName, setRepoName] = useState("");
  const IconComponent = icons[modal?.props?.value];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRepoListOpen, setIsRepoListOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const { data: repos } = useQuery(
    ["/repos", user.login], // 쿼리 키에 user.login을 추가하여 유저마다 캐시 관리
    () => fetchRepos({ login: user.login }), // 함수 참조 대신 익명 함수 사용하여 호출
  );

  const handleRepoListOpen = () => {
    setIsRepoListOpen((prev) => !prev);
  };

  const moveGithubPage = () => {
    window.open(`
    https://github.com/PNU-Capstone-4/${modal?.props?.value}
    `);
  };

  const handleOnisPrivate = (e) => {
    setIsPrivate(e.target.checked);
  };

  const handleRepoNameChange = (e) => {
    setRepoName(e.target.value);
  };

  const handleCreateRepo = async () => {
    if (!repoName) return;
    setIsSubmitting(true);

    const config = {
      headers: {
        Authorization: `token ${sessionStorage.getItem("accessToken")}`,
        Accept: "application/vnd.github.v3+json",
      },
    };
    const data = {
      name: repoName,
      private: isPrivate,
    };

    try {
      const response = await axios.post(
        `https://api.github.com/repos/kimchanho97/react/generate`,
        data,
        config,
      );
      console.log("Repository created successfully:", response.data);
    } catch (error) {
      console.error("Error creating repository:", error.response.data);
    }
    setIsSubmitting(false);
  };

  return (
    <div className=" fixed top-0 left-0 w-screen h-screen bg-[rgba(31,41,55,0.2)] flex justify-center items-center z-10">
      <div className=" w-[650px] h-[600px] rounded-lg bg-white opacity-100 p-1 overflow-y-auto">
        <div className=" flex justify-end">
          <button onClick={closeModal} className="pr-3 self-start pt-3">
            <IoIosCloseCircleOutline />
          </button>
        </div>
        <div className=" flex flex-col items-center">
          <div className=" py-10">
            <IconComponent className=" w-20 h-20" />
          </div>
          <div className=" w-full">
            <h1 className=" text-center text-[28px]">{modal?.props?.title}</h1>
            <h6 className=" text-center pt-3 text-zinc-500 flex flex-col">
              <span>아래 {modal?.props?.title} 템플릿 소스코드가</span>
              <span>{user.nickname}님의 Github 계정에 생성됩니다.</span>
            </h6>
          </div>
          <button
            className=" flex text-blue-500 items-center gap-2 mt-1"
            onClick={moveGithubPage}
          >
            <GithubIcon className=" w-4 h-4" />
            <span>PNU-Capstone-4/{modal?.props?.value}</span>
          </button>
        </div>
        <div className=" mt-16 px-8">
          <div className=" text-sm pl-2">GitHub 저장소</div>
          <div className=" mt-3 flex gap-3">
            <div className=" border w-[200px] p-2 flex gap-2 items-center h-[45px]">
              <img
                className=" w-8 h-8 rounded-full"
                src={user.avatar_url}
                alt="avatar"
              />
              <span className=" w-[200px] truncate">{user.login}</span>
            </div>
            <div className=" w-full relative">
              <input
                type="text"
                value={repoName}
                onChange={handleRepoNameChange}
                placeholder="저장소 이름을 입력하세요."
                className=" border w-full h-[45px] p-2 text-sm"
              />
              <button
                className=" absolute top-[14px] right-[8px]"
                onClick={handleRepoListOpen}
              >
                {isRepoListOpen ? (
                  <BsChevronUp size={20} />
                ) : (
                  <BsChevronDown size={20} />
                )}
              </button>
              {isRepoListOpen && (
                <ul className="w-full border">
                  {repos.map(({ id, name, private: isPrivate }) => (
                    <li
                      key={id}
                      className=" flex w-full justify-between items-center h-[45px] p-3 px-5 text-sm"
                    >
                      <span>{name}</span>
                      {isPrivate && (
                        <span className=" bg-orange-500 text-white p-1 text-xs px-2 rounded-md">
                          private
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className=" mt-3 flex gap-2 items-center">
            <label className=" relative cursor-pointer" htmlFor="isPrivate">
              <input
                id="isPrivate"
                className=" w-5 h-5 cursor-pointer"
                type="checkbox"
                onChange={handleOnisPrivate}
                value={isPrivate}
              />
              {!isPrivate && (
                <FaCheck
                  className=" absolute top-1 left-1 text-zinc-400"
                  size={12}
                />
              )}
            </label>
            <span className=" text-sm">비공개 저장소로 생성하기</span>
          </div>
          {isSubmitting ? (
            <div className="mt-14 flex justify-center items-center">
              <CircularProgress size={25} />
            </div>
          ) : (
            <button
              className=" w-full h-[40px] bg-blue-500 text-white rounded-lg mt-8 mb-16"
              onClick={handleCreateRepo}
            >
              저장소 생성하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
