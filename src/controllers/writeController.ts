require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
import * as ChallengeController from '../services/writeService';
import { prisma } from '@prisma/client';
import { imagesArrayDTO, videoArrayDTO } from '../interfaces/DTO'


export const newChallenge = async (req: any, res: Response, next: NextFunction) => {
    try {
        const newChallenge: string = req.params.name;
        const data = await ChallengeController.newChallengeData(req.decoded.id, newChallenge);
        const challengesCount: number = data?.challengesCount as number;
        const challengesOverlap: any = data?.challengesOverlap as any;
        if (data?.coopon) {
            if (challengesOverlap == undefined) {
                const startChallenge = await ChallengeController.startChallengeData(req.decoded.id, newChallenge);
                if (startChallenge) {
                    const data: any = await ChallengeController.newChallengeResult(req.decoded.id, startChallenge.chalIdData, startChallenge.newChallenge);
                    return res.status(200).json({
                        "code": 200,
                        "message": "OK",
                        "data": {
                            "challengeName": data.userChallenging,
                            templateData: {
                                challengeName: startChallenge.newChallenge,
                                template: data.challengTemplateArray
                            }
                        }
                    });
                }
            }
            else {
                return res.status(415).json({
                    "code": 415,
                    "message": "현재 진행 중인 챌린지와 중복됩니다.",
                });
            }
        } else {
            if (2 < challengesCount) {
                return res.status(418).json({
                    "code": 418,
                    "message": "더 이상 챌린지를 할 수 없습니다.",
                });
            } else {
                if (challengesOverlap == undefined) {
                    const startChallenge = await ChallengeController.startChallengeData(req.decoded.id, newChallenge);
                    if (startChallenge) {
                        const data: any = await ChallengeController.newChallengeResult(req.decoded.id, startChallenge.chalIdData, startChallenge.newChallenge);
                        return res.status(200).json({
                            "code": 200,
                            "message": "OK",
                            "data": {
                                "challengeName": data.userChallenging,
                                templateData: {
                                    challengeName: startChallenge.newChallenge,
                                    template: data.challengTemplateArray
                                }
                            }
                        });
                    }
                } else {
                    return res.status(415).json({
                        "code": 415,
                        "message": "현재 진행 중인 챌린지와 중복됩니다.",
                    });
                }
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};


export const writeChallenge = async (req: any, res: Response, next: NextFunction) => {
    try {
        const writeChallenge = await ChallengeController.writeChallengeData(req.decoded.id);
        const challengeCategoryDB = writeChallenge?.challengeArray;
        const challengeArray = [];
        const challengeChalIdyArray = [];

        for (var i = 0; i < challengeCategoryDB!.length; i++) {
            const challengeMap = challengeCategoryDB!.map((e) => {
                return { "title": e.challenges, "chal_id": e.chal_id, "category": e.challenges.category.name };
            });
            challengeArray.push({ "challengeName": challengeMap[i].title.title, "category": challengeMap[i].category });
            challengeChalIdyArray.push(challengeMap[i].chal_id);
        }
        if (!writeChallenge?.challengeArray[0].user_challenge_templetes[0]) {  // 값이 없다면
            var writeTemplate: any = await ChallengeController.writeTemplateData(challengeChalIdyArray[0]);
        }
        else {
            var writeTemplate: any =
                await ChallengeController.writeTemplateData(challengeChalIdyArray[0],
                    writeChallenge?.challengeArray[0].user_challenge_templetes[0].uctem_id);

        }
        const template = writeTemplate?.challengeTemplateDB;
        const category = writeTemplate?.categoryDB;
        const userTemplate = writeTemplate.userTemplates;
        const templateArray = [];
        let templateCertain: boolean;

        const templates = template.map((e: any) => {
            return { "title": e.title, "content": e.content, "category": e.challenges.category.name, "image": e.challenges.category.emogi }
        });
        templateArray.push(templates);

        console.log(templateArray);
        if (userTemplate == undefined) {
            templateCertain = false
        }
        else {
            templateCertain = true

        }
        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            "data": {
                templateCertain,
                userTemplate,
                challengeArray,
                templateData: {
                    challengeName: challengeArray[0].challengeName,
                    templateArray
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};

export const insertTemporaryChallenge = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { challengeName, templateName, challengeTitle, challengeContent } = req.body;

        const data =
            await ChallengeController.insertTemporaryChallengeData(req.decoded.id,
                challengeName,
                templateName,
                challengeTitle,
                challengeContent
            );
        if (data) {
            return res.status(200).json({
                "code": 200,
                "message": "Ok"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};

export const insertChallengeComplete = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { challengeName, templateName, challengeTitle, challengeContent } = req.body;

        const data =
            await ChallengeController.insertChallengeCompleteData(
                req.decoded.id,
                challengeName,
                templateName,
                challengeTitle,
                challengeContent
            );
        if (data) {
            return res.status(200).json({
                "code": 200,
                "message": "Ok"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};

export const selectTemplate = async (req: any, res: Response, next: NextFunction) => {
    try {
        const challengeName = req.params.challengeName;
        const data = await ChallengeController.selectTemplateData(challengeName, req.decoded.id);
        console.log(data)
        if (data) {
            return res.status(200).json({
                "code": 200,
                "message": "Ok",
                data
            });

        }
        return res.status(404).json({
            "code": 404,
            "message": "not found"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};

export const uploadImage = async (req: any, res: Response, next: NextFunction) => {
    try {
        const images: any[] = req.files;
        const imagesArrays: imagesArrayDTO = images.map((item) => {
            return {
                originalname: item.originalname,
                location: item.location
            };
        });
        if (!imagesArrays) {
            return res.status(404).json({
                "code": 404,
                "message": "not found"
            });

        }
        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            "images": imagesArrays
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};

export const uploadVideo = async (req: any, res: Response, next: NextFunction) => {
    try {
        const images: any[] = req.files;
        const videoArrays: videoArrayDTO = images.map((item) => {
            return {
                originalname: item.originalname,
                location: item.location
            };
        });
        if (!videoArrays) {
            return res.status(404).json({
                "code": 404,
                "message": "not found"
            });

        }
        return res.status(200).json({
            "code": 200,
            "message": "Ok",
            "videos": videoArrays
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            "code": 500,
            "message": "Server Error"
        });
    }
};















