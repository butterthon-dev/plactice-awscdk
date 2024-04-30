import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 } from 'aws-cdk-lib';


export class PlacticeDevVpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new aws_ec2.CfnVPC(this, 'plactice-dev-vpc', {
      cidrBlock: '192.168.0.0/16',
      enableDnsHostnames: false,
      tags: [
        { key: 'Name', value: 'plactice-dev-vpc' }
      ]
    });

    // インターネットゲートウェイを作成してVPCにアタッチ
    const igw = new aws_ec2.CfnInternetGateway(this, 'plactice-dev-igw', {
      tags: [
        { key: 'Name', value: 'plactice-dev-igw' }
      ]
    });
    new aws_ec2.CfnVPCGatewayAttachment(this, 'plactice-dev-vpc-igw-attachment', {
      vpcId: vpc.attrVpcId,
      internetGatewayId: igw.attrInternetGatewayId,
    });

    // パブリックサブネット
    const publicSubnet1a = new aws_ec2.CfnSubnet(this, 'plactice-dev-public-subnet-1a', {
      vpcId: vpc.attrVpcId,
      availabilityZone: 'ap-northeast-1a',
      cidrBlock: '192.168.1.0/24',
      tags: [
        { key: 'Name', value: 'plactice-dev-public-subnet-1a' }
      ]
    });
    const publicSubnet1c = new aws_ec2.CfnSubnet(this, 'plactice-dev-public-subnet-1c', {
      vpcId: vpc.attrVpcId,
      availabilityZone: 'ap-northeast-1c',
      cidrBlock: '192.168.2.0/24',
      tags: [
        { key: 'Name', value: 'plactice-dev-public-subnet-1c' }
      ]
    });

    // パブリックサブネットのルートテーブル
    const publicSubnet1aRouteTable = new aws_ec2.CfnRouteTable(this, 'plactice-dev-public-subnet-1a-rtb', {
      vpcId: vpc.attrVpcId,
      tags: [
        { key: 'Name', value: 'plactice-dev-public-subnet-1a-rtb' }
      ]
    });
    const publicSubnet1cRouteTable = new aws_ec2.CfnRouteTable(this, 'plactice-dev-public-subnet-1c-rtb', {
      vpcId: vpc.attrVpcId,
      tags: [
        { key: 'Name', value: 'plactice-dev-public-subnet-1c-rtb' }
      ]
    });
    new aws_ec2.CfnSubnetRouteTableAssociation(this, 'plactice-dev-public-subnet-1a-rtb-association', {
      routeTableId: publicSubnet1aRouteTable.attrRouteTableId,
      subnetId: publicSubnet1a.attrSubnetId,
    });
    new aws_ec2.CfnSubnetRouteTableAssociation(this, 'plactice-dev-public-subnet-1c-rtb-association', {
      routeTableId: publicSubnet1cRouteTable.attrRouteTableId,
      subnetId: publicSubnet1c.attrSubnetId,
    });
    new aws_ec2.CfnRoute(this, 'plactice-dev-public-subnet-1a-rtb-route', {
      routeTableId: publicSubnet1aRouteTable.attrRouteTableId,
      destinationCidrBlock: '0.0.0.0/0',
      gatewayId: igw.attrInternetGatewayId,
    });
    new aws_ec2.CfnRoute(this, 'plactice-dev-public-subnet-1c-rtb-route', {
      routeTableId: publicSubnet1cRouteTable.attrRouteTableId,
      destinationCidrBlock: '0.0.0.0/0',
      gatewayId: igw.attrInternetGatewayId,
    });

    // パブリックサブネット内にNATゲートウェイを作成
    const eip1a = new aws_ec2.CfnEIP(this, 'plactice-dev-eip-1a', {
      tags: [{ key: 'Name', value: 'plactice-dev-eip-1a' }]
    });
    const eip1c = new aws_ec2.CfnEIP(this, 'plactice-dev-eip-1c', {
      tags: [{ key: 'Name', value: 'plactice-dev-eip-1c' }]
    });
    const ngw1a = new aws_ec2.CfnNatGateway(this, 'plactice-dev-ngw-1a', {
      subnetId: publicSubnet1a.attrSubnetId,
      allocationId: eip1a.attrAllocationId,
      tags: [
        { key: 'Name', value: 'plactice-dev-ngw-1a' }
      ]
    });
    const ngw1c = new aws_ec2.CfnNatGateway(this, 'plactice-dev-ngw-1c', {
      subnetId: publicSubnet1c.attrSubnetId,
      allocationId: eip1c.attrAllocationId,
      tags: [
        { key: 'Name', value: 'plactice-dev-ngw-1c' }
      ]
    });

    // プライベートサブネット
    const privateSubnet1a = new aws_ec2.CfnSubnet(this, 'plactice-dev-private-subnet-1a', {
      vpcId: vpc.attrVpcId,
      availabilityZone: 'ap-northeast-1a',
      cidrBlock: '192.168.3.0/24',
      tags: [
        { key: 'Name', value: 'plactice-dev-private-subnet-1a' }
      ]
    });
    const privateSubnet1c = new aws_ec2.CfnSubnet(this, 'plactice-dev-private-subnet-1c', {
      vpcId: vpc.attrVpcId,
      availabilityZone: 'ap-northeast-1c',
      cidrBlock: '192.168.4.0/24',
      tags: [
        { key: 'Name', value: 'plactice-dev-private-subnet-1c' }
      ]
    });

    // プライベートサブネットのルートテーブル
    const privateSubnet1aRouteTable = new aws_ec2.CfnRouteTable(this, 'plactice-dev-private-subnet-1a-rtb', {
      vpcId: vpc.attrVpcId,
      tags: [
        { key: 'Name', value: 'plactice-dev-private-subnet-1a-rtb' }
      ]
    });
    const privateSubnet1cRouteTable = new aws_ec2.CfnRouteTable(this, 'plactice-dev-private-subnet-1c-rtb', {
      vpcId: vpc.attrVpcId,
      tags: [
        { key: 'Name', value: 'plactice-dev-private-subnet-1c-rtb' }
      ]
    });
    new aws_ec2.CfnSubnetRouteTableAssociation(this, 'plactice-dev-private-subnet-1a-rtb-association', {
      routeTableId: privateSubnet1aRouteTable.attrRouteTableId,
      subnetId: privateSubnet1a.attrSubnetId,
    });
    new aws_ec2.CfnSubnetRouteTableAssociation(this, 'plactice-dev-private-subnet-1c-rtb-association', {
      routeTableId: privateSubnet1cRouteTable.attrRouteTableId,
      subnetId: privateSubnet1c.attrSubnetId,
    });
    new aws_ec2.CfnRoute(this, 'plactice-dev-private-subnet-1a-rtb-route', {
      routeTableId: privateSubnet1aRouteTable.attrRouteTableId,
      destinationCidrBlock: '0.0.0.0/0',
      natGatewayId: ngw1a.attrNatGatewayId,
    });
    new aws_ec2.CfnRoute(this, 'plactice-dev-private-subnet-1c-rtb-route', {
      routeTableId: privateSubnet1cRouteTable.attrRouteTableId,
      destinationCidrBlock: '0.0.0.0/0',
      natGatewayId: ngw1c.attrNatGatewayId,
    });
  }
}
