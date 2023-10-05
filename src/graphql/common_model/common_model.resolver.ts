import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { CommonModelService } from './common_model.service';
import { UseGuards, Inject, Post } from '@nestjs/common';
// import { FileUpload, GraphQLUpload } from "graphql-upload";
import * as GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import * as Upload from "graphql-upload/Upload.js";
import {log} from "winston";
@Resolver('CommonModel')
export class CommonModelResolver {
  constructor(private readonly commonModelService: CommonModelService) {}

    @Mutation()
    async uploadFile(
        @Args({ name: 'file', type: () => GraphQLUpload })
        image: Upload,
        @Args({ name: 'channelInput', type: () => String})
            createFileInDirectory: String,
    ) {
      const file = await image;
      console.log("-> createFileInDirectory", createFileInDirectory);
        return await this.commonModelService.uploadImage(file.file);
    }

}
