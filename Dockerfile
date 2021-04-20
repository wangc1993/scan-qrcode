# 基础镜像
FROM centos

# 声明镜像维护者信息
LABEL carrey 1185778813@qq.com

RUN set -e; \
    mkdir -p /apps

# 12版本镜安装有问题
RUN curl --silent --location https://rpm.nodesource.com/setup_14.x | bash -
RUN yum -y install nodejs

# 构建node
COPY  dist/     /apps/
RUN  npm config set registry https://registry.npm.taobao.org
WORKDIR /apps
RUN  npm i

# 指定容器启动时要执行的命令，最后一个生效
CMD  ["npm", "start"]