import mongoose, { Document, Schema } from 'mongoose';

// PageView - 页面浏览记录
export interface IPageView extends Document {
  page: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const pageViewSchema = new Schema<IPageView>(
  {
    page: {
      type: String,
      required: true,
      maxlength: 500,
    },
    ip: String,
    userAgent: String,
    referrer: String,
    country: String,
    sessionId: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

pageViewSchema.index({ page: 1, createdAt: -1 });
pageViewSchema.index({ sessionId: 1 });
pageViewSchema.index({ ip: 1 });
pageViewSchema.index({ createdAt: -1 });

export const PageView = mongoose.model<IPageView>('PageView', pageViewSchema);

// ProjectInteraction - 项目交互记录
export interface IProjectInteraction extends Document {
  projectId: string;
  type: 'view' | 'like' | 'share';
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const projectInteractionSchema = new Schema<IProjectInteraction>(
  {
    projectId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['view', 'like', 'share'],
      required: true,
    },
    ip: String,
    userAgent: String,
    sessionId: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

projectInteractionSchema.index({ projectId: 1, type: 1 });
projectInteractionSchema.index({ projectId: 1, ip: 1, type: 1 });
projectInteractionSchema.index({ createdAt: -1 });

export const ProjectInteraction = mongoose.model<IProjectInteraction>('ProjectInteraction', projectInteractionSchema);

// FileMetadata - 文件元数据
export interface IFileMetadata extends Document {
  publicId: string;
  url: string;
  secureUrl: string;
  type: 'profile' | 'project' | 'blog' | 'general';
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
  uploadedBy?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const fileMetadataSchema = new Schema<IFileMetadata>(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['profile', 'project', 'blog', 'general'],
      default: 'general',
    },
    filename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    width: Number,
    height: Number,
    format: String,
    uploadedBy: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

fileMetadataSchema.index({ type: 1 });
fileMetadataSchema.index({ uploadedBy: 1 });
fileMetadataSchema.index({ createdAt: -1 });

export const FileMetadata = mongoose.model<IFileMetadata>('FileMetadata', fileMetadataSchema);

// SystemLog - 系统日志
export interface ISystemLog extends Document {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  userId?: string;
  ip?: string;
  requestId?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const systemLogSchema = new Schema<ISystemLog>(
  {
    level: {
      type: String,
      enum: ['info', 'warn', 'error', 'debug'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    userId: String,
    ip: String,
    requestId: String,
    stack: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

systemLogSchema.index({ level: 1, createdAt: -1 });
systemLogSchema.index({ source: 1 });
systemLogSchema.index({ createdAt: -1 });

// Auto-delete logs older than 30 days
systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const SystemLog = mongoose.model<ISystemLog>('SystemLog', systemLogSchema);
